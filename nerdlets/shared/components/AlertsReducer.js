import React from 'react';
import PropTypes from 'prop-types';

import { mapByGuid } from '../utils';
import cloneDeep from 'lodash.clonedeep';

export default class AlertsReducer extends React.PureComponent {
  static propTypes = {
    children: PropTypes.func,
    mapLocations: PropTypes.array,
    entities: PropTypes.array,
    workloadToEntityGuidsLookup: PropTypes.object,
    loading: PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.state = {
      flattened: [],
      entities: []
    };
  }

  componentDidMount() {
    if (!this.props.loading) {
      this.reduce();
    }
  }

  componentDidUpdate(prevProps) {
    if (
      (prevProps.mapLocations !== this.props.mapLocations ||
        prevProps.entities !== this.props.entities) &&
      !this.props.loading
    ) {
      this.reduce();
    }
  }

  reduce() {
    const { mapLocations, entities, workloadToEntityGuidsLookup } = this.props;

    const flattened = this.alertsReducer({
      mapLocations,
      entities,
      workloadToEntityGuidsLookup
    });
    this.setState({ flattened, entities: cloneDeep(entities) });
  }

  alertsReducer({
    mapLocations,
    entities: propEntities,
    workloadToEntityGuidsLookup
  }) {
    const entitiesMap = mapByGuid({ data: propEntities });

    // Aggregate alertViolations and recentAlertViolations
    const aggregator = (previousValue, currentValue) => {
      if (currentValue) {
        if (currentValue.alertViolations) {
          previousValue.alertViolations.push(...currentValue.alertViolations);
        }

        if (currentValue.recentAlertViolations) {
          previousValue.recentAlertViolations.push(
            ...currentValue.recentAlertViolations
          );
        }
      }
      return previousValue;
    };

    // For each item
    return mapLocations.map(ml => {
      const { document } = ml;
      const { entities = [] } = document;

      const {
        allEntities,
        alertViolations,
        recentAlertViolations
      } = entities.reduce(
        (previousValue, currentValue) => {
          const aggregatedResult = {
            alertViolations: [],
            recentAlertViolations: [],
            allEntities: []
          };

          if (currentValue.entityType === 'WORKLOAD_ENTITY') {
            const workloadEntity = entitiesMap[currentValue.guid];
            const workloadEntityGuids =
              workloadToEntityGuidsLookup[currentValue.guid];

            if (workloadEntityGuids) {
              // For each entity on a workload, pull back the entity
              const workloadEntities = workloadEntityGuids
                .map(guid => {
                  const entity = entitiesMap[guid];
                  if (!entity) {
                    /* eslint-disable no-console */
                    console.warn(
                      `No entity found in search results for: ${guid}`
                    );
                    /* eslint-enable */
                    return;
                  }

                  return entitiesMap[guid];
                })
                .filter(Boolean);

              const result = workloadEntities.reduce(aggregator, {
                alertViolations: [],
                recentAlertViolations: []
              });

              if (workloadEntity) {
                workloadEntities.push(workloadEntity);
              }

              Object.assign(aggregatedResult, result, {
                allEntities: workloadEntities
              });
            }
          } else {
            Object.assign(aggregatedResult, {
              alertViolations: currentValue.alertViolations || [],
              recentAlertViolations: currentValue.recentAlertViolations || [],
              allEntities: [currentValue]
            });
          }

          Object.keys(aggregatedResult).forEach(key => {
            if (Array.isArray(aggregatedResult[key])) {
              previousValue[key].push(...aggregatedResult[key]);
            }
          });

          return previousValue;
        },
        { allEntities: [], alertViolations: [], recentAlertViolations: [] }
      );

      ml.document.alertViolations = alertViolations;
      ml.document.recentViolations = recentAlertViolations;
      ml.document.entities = allEntities;

      return ml;
    });
  }

  render() {
    const { children, workloadToEntityGuidsLookup } = this.props;
    const { entities, flattened } = this.state;

    return children({
      mapLocations: flattened,
      entities,
      workloadToEntityGuidsLookup
    });
  }
}
