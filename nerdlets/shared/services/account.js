import { NerdGraphQuery } from 'nr1';

export const getAccounts = () => {
  return NerdGraphQuery.query({
    query: `
      {
        actor {
          accounts {
            id
          }
        }
      }
    `,
    fetchPolicyType: NerdGraphQuery.FETCH_POLICY_TYPE.NO_CACHE
  });
};
