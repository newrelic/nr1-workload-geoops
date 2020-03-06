import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import get from 'lodash.get';
import uniq from 'lodash.uniq';

import { EntitiesByGuidsQuery, NerdGraphQuery, Spinner } from 'nr1';

import { NerdGraphError } from '@newrelic/nr1-community';
import { mapByGuid } from '../shared/utils';
import AlertableEntitiesByGuidsQuery from '../shared/components/AlertableEntitiesByGuidsQuery';
import MapLocationQuery from '../shared/components/MapLocationQuery';
import { LIST_WORKLOADS } from '../shared/services/queries';

const entityFragmentExtension = gql`
  fragment EntityFragmentExtension on EntityOutline {
    indexedAt
    guid
    entityType
    ... on AlertableEntityOutline {
      alertSeverity
    }
  }
`;

export default class ViewMapQuery extends React.PureComponent {
  static propTypes = {
    map: PropTypes.object,
    children: PropTypes.func
  };

  filterWorkloadResponse({ data, filterByWorkloadsLookup }) {
    const workloads = get(data, 'actor.account.workload.collections');
    const lookup = filterByWorkloadsLookup;

    const result = workloads.reduce(
      (previousValue, currentValue) => {
        const workloadGuid = currentValue.guid;
        if (!workloadGuid) {
          console.log('Workload is missing guid');
        }

        if (lookup[workloadGuid]) {
          const entityGuids = currentValue.entities.map(e => e.guid);

          previousValue.workloadToEntityGuidsLookup[workloadGuid] = [];
          previousValue.workloadToEntityGuidsLookup[workloadGuid].push(
            ...entityGuids
          );

          previousValue.workloadEntityGuids.push(...entityGuids);
        }

        return previousValue;
      },
      { workloadEntityGuids: [], workloadToEntityGuidsLookup: {} }
    );

    return result;
  }

  entitiesFromMapLocations({ mapLocations }) {
    const allEntities = mapLocations.reduce((previousValue, currentValue) => {
      const entities = currentValue.document.entities || [];
      previousValue.push(...entities);
      return previousValue;
    }, []);
    const entityGuids = uniq(allEntities.map(e => e.guid));
    return {
      entities: allEntities,
      entityGuids
    };
  }

  groupByEntityType({ data }) {
    const initialState = { workloads: [], otherEntities: [] };
    const entities = data.entities;

    if (!Array.isArray(entities)) {
      return initialState;
    }

    return entities.reduce((previousValue, currentValue) => {
      if (currentValue.entityType === 'WORKLOAD_ENTITY') {
        previousValue.workloads.push(currentValue);
      } else {
        previousValue.otherEntities.push(currentValue);
      }
      return previousValue;
    }, initialState);
  }

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
          // console.log(currentValue);
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
            alertViolations = currentValue.alertViolations;
            recentAlertViolations = currentValue.recentAlertViolations;
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

    // Get entities for each workload
    // Aggregate alerts
    // entities is all entities associated with this marker, could be multiple workloads
    // const alertsReducer = entities => {

    // };
    // const alerts = alertsReducer(activeMapLocation.entities);
  }

  render() {
    const { children, map } = this.props;

    // 1. Map Locations
    return (
      <MapLocationQuery map={map}>
        {({ loading, errors, data: mapLocations }) => {
          if (errors) {
            //
          }

          if (loading) {
            return (
              <div className="geoOpsContainer">
                <Spinner />
              </div>
            );
          }

          const { entityGuids } = this.entitiesFromMapLocations({
            mapLocations
          });

          const hasAssociatedEntities = entityGuids && entityGuids.length > 0;
          if (!hasAssociatedEntities) {
            return children({
              mapLocations
            });
          }

          // 2. All MapLocation Entities
          return (
            <>
              {map && (
                <>
                  <EntitiesByGuidsQuery
                    entityGuids={entityGuids}
                    entityFragmentExtension={entityFragmentExtension}
                    fetchPolicyType={
                      EntitiesByGuidsQuery.FETCH_POLICY_TYPE.NO_CACHE
                    }
                  >
                    {({ loading, error, data }) => {
                      if (loading) {
                        return <Spinner>Loading related entities</Spinner>;
                      }

                      if (error) {
                        //
                        return <NerdGraphError error={error} />;
                      }

                      // Group by workloads and non-workloads
                      const {
                        workloads,
                        otherEntities
                      } = this.groupByEntityType({ data });

                      // Query workloads api for entity guids

                      /*
                       * @future
                       * Currently there is no way to ask the Workloads API for a specific set of Workloads
                       * Until that exists, we load _ALL_ workloads for a given Account
                       * and then filter down to the set we care about
                       */

                      // 3. Workloads and associated entities
                      return (
                        <NerdGraphQuery
                          query={LIST_WORKLOADS}
                          variables={{ accountId: map.accountId }}
                          fetchPolicyType={
                            NerdGraphQuery.FETCH_POLICY_TYPE.NO_CACHE
                          }
                        >
                          {({ loading, error, data }) => {
                            if (loading) {
                              return <Spinner>Loading workloads</Spinner>;
                            }

                            if (error) {
                              return <NerdGraphError error={error} />;
                            }

                            const filterByWorkloadsLookup = mapByGuid({
                              data: workloads
                            });
                            const workloadGuids = Object.keys(
                              filterByWorkloadsLookup
                            );

                            // Filter by workloads tied to this map
                            const {
                              workloadEntityGuids: filteredWorkloadEntities,
                              workloadToEntityGuidsLookup
                            } = this.filterWorkloadResponse({
                              data,
                              filterByWorkloadsLookup
                            });

                            // Combine entities with entities from workloads
                            const allEntityGuids = workloadGuids.concat(
                              otherEntities.concat(filteredWorkloadEntities)
                            );

                            // 4. All Workloads + Workload Entities + Entities
                            return (
                              <AlertableEntitiesByGuidsQuery
                                entityGuids={allEntityGuids}
                                fetchPolicyType={
                                  EntitiesByGuidsQuery.FETCH_POLICY_TYPE
                                    .NO_CACHE
                                }
                              >
                                {({ loading, error, data }) => {
                                  if (loading) {
                                    return <Spinner />;
                                  }

                                  if (error) {
                                    return <NerdGraphError error={error} />;
                                  }

                                  return children({
                                    mapLocations: this.alertsReducer({
                                      mapLocations,
                                      entities: data,
                                      workloadToEntityGuidsLookup
                                    }),
                                    entities: data,
                                    workloadToEntityGuidsLookup
                                  });
                                }}
                              </AlertableEntitiesByGuidsQuery>
                            );
                          }}
                        </NerdGraphQuery>
                      );
                    }}
                  </EntitiesByGuidsQuery>
                </>
              )}
            </>
          );
        }}
      </MapLocationQuery>
    );
  }
}
