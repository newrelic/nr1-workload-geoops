export const LIST_WORKLOADS = `
query ($accountId: Int!) {
  actor {
    __typename
    account(id: $accountId) {
      workload {
        collections {
          id
          guid
          entities {
            guid
          }
          entitySearchQueries {
            id
            query
            updatedAt
            createdAt
          }
          entitySearchQuery
          name
          permalink
          scopeAccounts {
            accountIds
          }
          updatedAt
          createdAt
        }
      }
    }
  }
}
`;

export const SINGLE_WORKLOAD = `
query ($accountId: Int!, $id: Int!) {
  actor {
    __typename
    account(id: $accountId) {
      workload {
        collection(id: $id) {
          id
          name
          guid
        }
      }
    }
  }
}
`;

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

export const _generateChunks = guids => {
  const chunks = [];
  const n = guids.length;
  let i = 0;

  while (i < n) {
    chunks.push(guids.slice(i, (i += 25)));
  }

  return chunks;
};

export const getEntitiesByGuidsQuery = variables => {
  const { entityGuids = [] } = variables;

  const _generateQuery = (entityGuids, index) => {
    return `
      query${index}: entities(guids: "${entityGuids}") {
        ...EntityInfo
        ...EntityTags @include(if: $includeTags)
      }
    `;
  };

  const fullQuery = _generateChunks(entityGuids).map((chunk, index) => {
    return _generateQuery(chunk, index);
  });

  return `
    query EntityDetails($includeTags: Boolean = false, $includeAlertViolations: Boolean = true, $begin_time: EpochMilliseconds = 0, $end_time: EpochMilliseconds = 0) {
      actor {
        ${fullQuery.join(',\n')}
      }
    }
    
    fragment EntityInfo on Entity {
      guid
      accountId
      domain
      type
      name
      reporting
      ... on AlertableEntity {
        alertSeverity
          alertViolations(endTime: $end_time, startTime: $begin_time) @include(if: $includeAlertViolations) {
            ...AlertInfo
          }
    
          recentAlertViolations(count: 10) @include(if: $includeAlertViolations) {
            ...AlertInfo
          }
        __typename
      }
      __typename
    }
    
    fragment EntityTags on Entity {
      tags {
        key
        values
        __typename
      }
      __typename
    }
    
    fragment AlertInfo on EntityAlertViolation {
      agentUrl
      alertSeverity
      closedAt
      label
      level
      openedAt
      violationId
      violationUrl
    }
  `;
};
