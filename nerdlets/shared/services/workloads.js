import { nerdGraphQuery } from '../utils';
import { LIST_WORKLOADS, SINGLE_WORKLOAD } from './queries';

// TO DO - Is it going to be "id" or "guid"? Awaiting response from the Workloads team.
// eslint-disable-next-line no-unused-vars
export const getWorkload = ({ accountId, id, guid, fixtureData = false }) => {
  if (fixtureData) {
    return Promise.resolve({
      data: {
        actor: {
          __typename: 'Actor',
          account: {
            workload: {
              collection: {
                guid: 'NjMwMDYwfE5SMXxXT1JLTE9BRHw0OA',
                id: 48,
                name: "Adilson's Workload"
              }
            }
          }
        }
      }
    });
  }

  return nerdGraphQuery({
    query: SINGLE_WORKLOAD,
    variables: { accountId, id }
  });
};

export const getWorkloads = ({ accountId }) => {
  return nerdGraphQuery({ query: LIST_WORKLOADS, variables: { accountId } });
};
