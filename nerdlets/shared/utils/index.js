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

// http://oms.wff.ch/calc.htm
// GNU GPL v2 or later
// https://www.dropbox.com/s/xllwzgezlsqebdg/Screenshot%202020-02-25%2016.26.06.png?dl=0

function long2tile(lon, zoom) {
  const tt = Number(lon);
  return Math.floor(((tt + 180) / 360) * Math.pow(2, zoom));
}

function lat2tile(lat, zoom) {
  return Math.floor(
    ((1 -
      Math.log(
        Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
      ) /
        Math.PI) /
      2) *
      Math.pow(2, zoom)
  );
}

export const latLngToTile = function({ latLng, zoom }) {
  return {
    s: 'a', // a, b, c - different subdomains for parallelizing requests
    x: long2tile(latLng[1], zoom),
    y: lat2tile(latLng[0], zoom),
    z: zoom
  };
};

export const mapByGuid = ({ data }) => {
  if (!Array.isArray(data)) {
    return {};
  }

  const map = data.reduce((previousValue, currentValue) => {
    previousValue[currentValue.guid] = currentValue;
    return previousValue;
  }, {});
  return map;
};
