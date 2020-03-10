import React from 'react';
import PropTypes from 'prop-types';

import { mapByGuid } from '../utils';

export default class AlertsReducer extends React.PureComponent {
  static propTypes = {
    children: PropTypes.func,
    mapLocations: PropTypes.array,
    entities: PropTypes.array,
    workloadToEntityGuidsLookup: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  // TO DO - _actually_ make this recursive
  alertsReducer({
    mapLocations,
    entities: allEntities,
    workloadToEntityGuidsLookup
  }) {
    // For each item
    return mapLocations.map(ml => {
      const { document } = ml;
      const { entities = [] } = document;

      // console.log(ml);
      // console.log(entities);
      // console.log(workloadToEntityGuidsLookup);

      const entitiesMap = mapByGuid({ data: allEntities });

      const { alertViolations, recentAlertViolations } = entities.reduce(
        (previousValue, currentValue) => {
          let alertViolations = [];
          let recentAlertViolations = [];

          if (currentValue.entityType === 'WORKLOAD_ENTITY') {
            // console.log(currentValue.guid);
            const workloadEntityGuids =
              workloadToEntityGuidsLookup[currentValue.guid];

            // console.log(workloadEntityGuids);
            if (workloadEntityGuids) {
              // For each entity on a workload, pull back the entity
              const workloadEntities = workloadEntityGuids.map(guid => {
                return entitiesMap[guid];
              });

              // Aggregate alertViolations and recentAlertViolations
              const result = workloadEntities.reduce(
                (previousValue, currentValue) => {
                  // console.log(currentValue);
                  if (currentValue) {
                    if (currentValue.alertViolations) {
                      previousValue.alertViolations.push(
                        ...currentValue.alertViolations
                      );
                    }

                    if (currentValue.recentAlertViolations) {
                      previousValue.recentAlertViolations.push(
                        ...currentValue.recentAlertViolations
                      );
                    }
                  }
                  return previousValue;
                },
                {
                  alertViolations: [],
                  recentAlertViolations: []
                }
              );

              // console.log(result);
              alertViolations = result.alertViolations;
              recentAlertViolations = result.recentAlertViolations;
            }
          } else {
            alertViolations = currentValue.alertViolations || [];
            recentAlertViolations = currentValue.recentAlertViolations || [];
          }

          if (alertViolations) {
            previousValue.alertViolations.push(...alertViolations);
          }

          if (recentAlertViolations) {
            previousValue.recentAlertViolations.push(...recentAlertViolations);
          }

          return previousValue;
        },
        { alertViolations: [], recentAlertViolations: [] }
      );

      ml.document.alertViolations = alertViolations;
      ml.document.recentViolations = recentAlertViolations;

      // console.log(ml.document);

      return ml;
    });
  }

  render() {
    const {
      children,
      mapLocations,
      entities,
      workloadToEntityGuidsLookup
    } = this.props;

    const flattened = this.alertsReducer({
      mapLocations,
      entities,
      workloadToEntityGuidsLookup
    });

    return children({
      mapLocations: flattened,
      entities,
      workloadToEntityGuidsLookup
    });
  }
}
