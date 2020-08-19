/*
 * Sample response:
 [
    {
      domain: 'NR1',
      entityType: 'WORKLOAD_ENTITY',
      type: 'WORKLOAD'
    },
    {
      domain: 'SYNTH',
      entityType: 'SYNTHETIC_MONITOR_ENTITY',
      type: 'MONITOR'
    },
    {
      domain: 'BROWSER',
      entityType: 'BROWSER_APPLICATION_ENTITY',
      type: 'APPLICATION'
    }
  ]
*/
export const LIST_ENTITY_TYPES = `
{
  actor {
    entitySearch(query: null) {
      types {
        domain
        type
        entityType
      }
    }
  }
}
`;

export const ENTITY_SEARCH_BY_TYPE = `
query($query: String!) {
  actor {
    entitySearch(query: $query) {
      results {
        entities {
          name
          guid
          accountId
          domain
          type
          entityType
        }
      }
    }
  }
}
`;

/*
 * Similar in intent to <EntitiesByGuidsQuery> but hitting the `actor -> account -> entities` namespace
 * instead of `actor -> account -> entitySearch` namespace so that we can get access
 * to the full AlertableEntity fragment instead of just the AlertableEntityOutline
 */

/*
 * Sample response:

 {
    "__typename": "ApmApplicationEntity",
    "accountId": 630060,

    // alertSeverity and alertViolations aren't guaranteed to be present
    "alertSeverity": "CRITICAL",
    "alertViolations": [
        {
          "alertSeverity": null,
          "violationId": 782921508,
          "violationUrl": "https://alerts.newrelic.com/accounts/630060/incidents/114002461/violations?id=782921508"
        },
        {
          "alertSeverity": null,
          "violationId": 782902557,
          "violationUrl": "https://alerts.newrelic.com/accounts/630060/incidents/113999954/violations?id=782902557"
        },
      }
    ],
    "domain": "APM",
    "entityType": "APM_APPLICATION_ENTITY",
    "guid": "NjMwMDYwfEFQTXxBUFBMSUNBVElPTnw2MDgwNzg2",
    "indexedAt": 1583257737544,
    "name": "Origami Portal",
    "reporting": true,
    "type": "APPLICATION"
  },
*/

/**
 * Because the entities endpoint in NerdGraph has a limit of 25 entities (if you use the `guids` input), we need to chunk the list.
 */
const _generateChunks = list => {
  const chunks = [];
  const n = list.length;
  let i = 0;

  while (i < n) {
    chunks.push(list.slice(i, (i += 25)));
  }

  return chunks;
};

const _generateEntitiesQuery = (entityGuids, index) => {
  return `
    query${index}: entities(guids: ${JSON.stringify(entityGuids)}) {
      ...EntityInfo
      ...EntityTags @include(if: $includeTags)
    }
  `;
};

export const getEntitiesByGuidsQuery = variables => {
  const { entityGuids = [] } = variables;

  const fullQuery = _generateChunks(entityGuids).map((chunk, index) => {
    return _generateEntitiesQuery(chunk, index);
  });

  return `
    query EntityDetails($includeTags: Boolean = false, $includeAlertViolations: Boolean = true, $includeRecentAlertViolations: Boolean = false, $begin_time: EpochMilliseconds = 0, $end_time: EpochMilliseconds = 0) {
      actor {
        ${fullQuery.join(',\n')}
      }
    }

    fragment EntityInfo on Entity {
      guid
      accountId
      type
      name
      reporting
      ... on AlertableEntity {
        alertSeverity
        alertViolations(endTime: $end_time, startTime: $begin_time) @include(if: $includeAlertViolations) {
          ...AlertInfo
        }
        recentAlertViolations(count: 10) @include(if: $includeRecentAlertViolations) {
          ...AlertInfo
        }
      }
    }

    fragment EntityTags on Entity {
      tags {
        key
        values
      }
    }

    fragment AlertInfo on EntityAlertViolation {
      alertSeverity
      closedAt
      label
      openedAt
      violationId
      violationUrl
    }
  `;
};

/**
 * Generate a segment of a GraphQL query to retrieve the account > workload > collection > entitySearchQuery
 */
export const getWorkloadEntitySearchQuery = variables => {
  // debugger;
  const { workloads = [] } = variables;

  const _entitySearchQuery = workload => {
    return `
    ${workload.guid}: account(id: ${workload.accountId}) {
      workload {
        collection(guid: "${workload.guid}") {
          entitySearchQuery
        }
      }
    }
    `;
  };

  if (workloads.length === 0) {
    return ``;
  }
  const queries = workloads.map((workload, index) =>
    _entitySearchQuery(workload, index)
  );
  return `{
    actor {
      ${queries.join(',\n')}
    }
  }`;
};

/**
 * Generate a NerdGraph request that includes entity searches and lists of guids.
 * Our objective is to create a request to retrieve the entity alongside its alertSeverity AND the 10 most recent alert violations.
 */
export const getWorkloadEntityGuidsQuery = variables => {
  const { entitySearchQueries } = variables;
  const workloadQueries = entitySearchQueries.map(
    (entitySearchQuery, index) => {
      return `
      workloadQuery${index}: entitySearch(query: "${entitySearchQuery}") {
        results {
          entities {
            guid
          }
        }
      }
    `;
    }
  );

  return `{
      actor {
        ${workloadQueries.join(',\n')}
      }
    }
  `;
};
