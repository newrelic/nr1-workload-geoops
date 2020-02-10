import { NerdGraphQuery } from 'nr1';

export const nerdStorageRequest = async function({ dataFetcher, params }) {
  const { data, errors } = await dataFetcher(params);

  return { data, errors };
};

export const nerdGraphQuery = async function({
  query,
  variables,
  fetchPolicyType
}) {
  if (!fetchPolicyType) {
    fetchPolicyType = NerdGraphQuery.FETCH_POLICY_TYPE.NO_CACHE;
  }

  return NerdGraphQuery.query({ query, variables, fetchPolicyType });
};
