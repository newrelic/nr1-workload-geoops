import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';

import { EntitiesByGuidsQuery, NerdGraphQuery, Spinner } from 'nr1';

import { NerdGraphError } from '@newrelic/nr1-community';
import AlertableEntitiesByGuidsQuery from '../../shared/components/AlertableEntitiesByGuidsQuery';
import MapLocationQuery from '../../shared/components/MapLocationQuery';
import EntitiesFromWorkloads from '../../shared/components/EntitiesFromWorkloads';
import AlertsReducer from '../../shared/components/AlertsReducer';
import MapLocationDistiller from '../../shared/components/MapLocationDistiller';

import { LIST_WORKLOADS } from '../../shared/services/queries';

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
    begin_time: PropTypes.number,
    end_time: PropTypes.number,
    children: PropTypes.func
  };

  render() {
    const { map, begin_time, end_time, children } = this.props;

    // 1. Map Locations
    return (
      <MapLocationQuery map={map}>
        {({ loading, errors, data }) => {
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

          const { mapLocations, entityGuids } = data;

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
                    {({ loading, error, data: mapLocationEntities }) => {
                      if (loading) {
                        return (
                          <>
                            {/* <h2>Loading related entities...</h2> */}
                            <Spinner />
                          </>
                        );
                      }

                      if (error) {
                        return <NerdGraphError error={error} />;
                      }

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
                          variables={{ accountId: parseInt(map.accountId, 10) }}
                          fetchPolicyType={
                            NerdGraphQuery.FETCH_POLICY_TYPE.NO_CACHE
                          }
                        >
                          {({ loading, error, data: workloads }) => {
                            if (loading) {
                              return (
                                <>
                                  {/* <h2>Loading workloads...</h2> */}
                                  <Spinner />
                                </>
                              );
                            }

                            if (error) {
                              return <NerdGraphError error={error} />;
                            }

                            // 4. All Workloads + Workload Entities + Entities
                            // workloadEntities is the result of aggregating all workload entities from MapLocations
                            // data is the result of querying for the associated workloads to get at their underlying entities

                            return (
                              <EntitiesFromWorkloads
                                mapLocationEntities={mapLocationEntities}
                                workloads={workloads}
                              >
                                {({
                                  entityGuids,
                                  workloadToEntityGuidsLookup
                                }) => {
                                  return (
                                    <AlertableEntitiesByGuidsQuery
                                      entityGuids={entityGuids}
                                      fetchPolicyType={
                                        EntitiesByGuidsQuery.FETCH_POLICY_TYPE
                                          .NO_CACHE
                                      }
                                      begin_time={begin_time}
                                      end_time={end_time}
                                    >
                                      {({ loading, error, data: entities }) => {
                                        if (loading) {
                                          return (
                                            <>
                                              {/* <h2>Loading entity Alerts</h2> */}
                                              <Spinner />
                                            </>
                                          );
                                        }

                                        if (error) {
                                          return (
                                            <NerdGraphError error={error} />
                                          );
                                        }
                                        /*
                                          TO DO - When clicking on a map marker, AlertsReducer says 'entities' has changed
                                          This causes a cascading re-render of everything below it
                                          How does 'entities' change without re-running any queries?
                                          Temporarily we're storing a copy in local state in AlertsReducer which "fixes" this
                                        */
                                        return (
                                          <AlertsReducer
                                            mapLocations={mapLocations}
                                            entities={entities}
                                            workloadToEntityGuidsLookup={
                                              workloadToEntityGuidsLookup
                                            }
                                          >
                                            {({
                                              mapLocations,
                                              entities,
                                              workloadToEntityGuidsLookup
                                            }) => {
                                              return (
                                                <>
                                                  <MapLocationDistiller
                                                    mapLocations={mapLocations}
                                                    entities={entities}
                                                    entityToEntitiesLookup={
                                                      workloadToEntityGuidsLookup
                                                    }
                                                  >
                                                    {/* Note: we have multiple variables named mapLocations scoped differently */}
                                                    {({
                                                      data: mapLocations
                                                    }) => {
                                                      // console.log(mapLocations);
                                                      return children({
                                                        mapLocations,
                                                        entities,
                                                        workloadToEntityGuidsLookup
                                                      });
                                                    }}
                                                  </MapLocationDistiller>
                                                </>
                                              );
                                            }}
                                          </AlertsReducer>
                                        );
                                      }}
                                    </AlertableEntitiesByGuidsQuery>
                                  );
                                }}
                              </EntitiesFromWorkloads>
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
