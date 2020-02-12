export const LIST_WORKLOADS = `
query ($accountId: Int!) {
  actor {
    __typename
    account(id: $accountId) {
      workload {
        collections {
          id
          entities {
            guid
          }
          entitySearchQueries {
            id
            name
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
        }
      }
    }
  }
}
`;
