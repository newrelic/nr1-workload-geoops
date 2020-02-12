import { NerdGraphQuery } from 'nr1';

/*
 * TO DO - This pattern of making a request per account to NerdStorage is likely
 * common in 1st party apps, we should look at how they do it and if we can utilize similar methodology.
 */
export const nerdStorageRequest = async function({ service, params }) {
  const result = await service(params);

  let response;

  // Aggregate errors and data from multiple requests
  if (Array.isArray(result)) {
    response = result.reduce(
      (finalValue, currentValue) => {
        const data = currentValue.data;
        const errors = Array.isArray(currentValue.errors)
          ? currentValue.errors
          : [];
        return {
          // data: [...finalValue.data, currentValue.data],
          data: finalValue.data.concat(data),
          errors: finalValue.errors.concat(errors)
        };
      },
      {
        data: [],
        errors: []
      }
    );
    response = {
      data: response.data,
      errors: response.errors.length > 0 ? response.errors : null
    };
  } else {
    response = result;
  }

  // console.log([response]);
  return response;
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
