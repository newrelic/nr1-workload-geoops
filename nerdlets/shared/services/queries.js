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
