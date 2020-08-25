import { NerdGraphQuery } from 'nr1';

import L from 'leaflet';
import get from 'lodash.get';

/*
 * TODO: This pattern of making a request per account to NerdStorage is likely
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

const _WORKLOAD_STATUS_TO_ALERT_SEVERITY = {
  'DEGRADED': 'WARNING',
  'DISRUPTED': 'CRITICAL',
  'OPERATIONAL': 'NOT_ALERTING',
  'UNKNOWN': 'NOT_CONFIGURED',
}

/**
 * nerdlets/shared/services/queries/getEntitiesByGuidsQuery includes a reference to `workloadStatus > statusValue`. If this entity has that value and does not have an alertSeverity, set the alertSeverity based on a
 * @param {*} entity
 */
export const mapWorkloadStatusValueToAlertSeverity = (entity) => {
  const alertSeverity = get(entity, 'alertSeverity');
  const reporting = get(entity, 'reporting');
  const workloadStatusValue = get(entity, 'workloadStatus.statusValue');
  if (!alertSeverity && workloadStatusValue) {
    entity.alertSeverity = _WORKLOAD_STATUS_TO_ALERT_SEVERITY[workloadStatusValue];
  } else if (!alertSeverity && reporting) {
    alertSeverity = 'NOT_ALERTING';
  }
  console.debug(entity);
  return entity;
}

export const statusColor = mapLocation => {
  const colors = {
    green: '#13BA00',
    yellow: '#FFB951',
    red: '#FF0000',
    gray: '#8E9494',
    white: '#FFFFFF',
    darkGreen: '#005054'
  };

  const severityToColor = {
    CRITICAL: 'red',
    WARNING: 'yellow',
    NOT_ALERTING: 'green',
    NOT_CONFIGURED: 'gray'
  };

  if (mapLocation) {
    const alertSeverity = get(
      mapLocation,
      'mostCriticalEntity.alertSeverity',
      false
    );

    if (alertSeverity) {
      return colors[severityToColor[alertSeverity]] || colors.darkGreen;
    } else {
      return colors.darkGreen;
    }
  } else {
    return colors.darkGreen;
  }
};

const severityWeight = {
  CRITICAL: 1,
  WARNING: 2,
  NOT_ALERTING: 3,
  NOT_CONFIGURED: 4
};

export const alertSeverityToWeight = value => {
  return severityWeight[value] || 5;
};

const _weightToAlertSeverity = {
  1: 'CRITICAL',
  2: 'WARNING',
  3: 'NOT_ALERTING',
  4: 'NOT_CONFIGURED'
};

export const weightToAlertSeverity = value => {
  return _weightToAlertSeverity[value] || '';
};

export const sortEntitiesByAlertSeverity = (a, b) => {
  const aWeight = alertSeverityToWeight(a.alertSeverity);
  const bWeight = alertSeverityToWeight(b.alertSeverity);
  if (aWeight < bWeight) {
    return -1;
  } else if (bWeight < aWeight) {
    return 1;
  }
  return 0;
};

export const sortAlertViolations = (a, b) => {
  const aClosedAt = a.closedAt;
  const bClosedAt = b.closedAt;
  if (!aClosedAt || aClosedAt > bClosedAt) {
    return -1;
  } else if (!bClosedAt || bClosedAt < aClosedAt) {
    return 1;
  }
  return 0;
};

export const generateIcon = (mapLocation, isSelectedIcon) => {
  return L.divIcon({
    className: 'marker',
    iconSize: [10, 10],
    html: `
      <span>
        <svg
          width="35"
          height="44"
          viewBox="0 0 35 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="marker-icon-svg ${
            isSelectedIcon ? 'selected-marker-icon' : ''
          }"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M34.9903 18.0877C34.9968 17.8926 35 17.6967 35 17.5C35 7.83502 27.165 0 17.5 0C7.83502 0 0 7.83502 0 17.5C0 17.6967 0.00324409 17.8926 0.00968167 18.0877C0.00324823 18.1947 1.4916e-07 18.3027 0 18.4118C-1.23978e-05 29.7353 17.5 43.1176 17.5 43.1176C17.5 43.1176 35 29.7353 35 18.4118C35 18.3027 34.9967 18.1947 34.9903 18.0877Z"
            fill="#005054"
          />
          <path
            d="M27 17.5C27 22.7467 22.7467 27 17.5 27C12.2533 27 8 22.7467 8 17.5C8 12.2533 12.2533 8 17.5 8C22.7467 8 27 12.2533 27 17.5Z"
            fill="white"
          />
          <path
            d="M24 17.5C24 21.0899 21.0899 24 17.5 24C13.9101 24 11 21.0899 11 17.5C11 13.9101 13.9101 11 17.5 11C21.0899 11 24 13.9101 24 17.5Z"
            fill="${statusColor(mapLocation)}"
          />
        </svg>
      </span>
    `
  });
};
