import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import get from 'lodash.get';
import uniq from 'lodash.uniq';

import {
  Button,
  Dropdown,
  DropdownItem,
  EntitiesByGuidsQuery,
  Stack,
  StackItem,
  NerdGraphQuery,
  Spinner,
  Tabs,
  TabsItem
} from 'nr1';

import {
  EmptyState,
  NerdGraphError,
  DetailPanel
} from '@newrelic/nr1-community';

import GeoMap from './geo-map';
import Toolbar from '../shared/components/Toolbar';
import MapLocationTable from '../shared/components/MapLocationTable';
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

const mapByGuid = ({ data }) => {
  if (!Array.isArray(data)) {
    return {};
  }

  const map = data.reduce((previousValue, currentValue) => {
    previousValue[currentValue.guid] = currentValue;
    return previousValue;
  }, {});
  return map;
};

const LeftToolbar = ({ navigation }) => {
  return (
    <>
      <StackItem className="toolbar-item has-separator">
        <Button
          onClick={() => navigation.router({ to: 'mapList' })}
          type={Button.TYPE.PLAIN}
          iconType={Button.ICON_TYPE.INTERFACE__CHEVRON__CHEVRON_LEFT}
        >
          Back to main view
        </Button>
      </StackItem>
      <StackItem className="toolbar-item has-separator">
        <Dropdown title="Choose an Account">
          <DropdownItem>Account 1</DropdownItem>
          <DropdownItem>Account 2</DropdownItem>
          <DropdownItem>Account 3</DropdownItem>
        </Dropdown>
      </StackItem>
      <StackItem className="toolbar-item has-separator">
        <Dropdown label="Map" title="Choose a map">
          <DropdownItem>Map 1</DropdownItem>
          <DropdownItem>Map 2</DropdownItem>
          <DropdownItem>Map 3</DropdownItem>
        </Dropdown>
      </StackItem>
    </>
  );
};
LeftToolbar.propTypes = {
  navigation: PropTypes.object
};

const RightToolbar = ({ navigation }) => {
  return (
    <>
      <StackItem className="">
        <Button onClick={() => navigation.router({ to: 'createMap' })}>
          New Map
        </Button>
      </StackItem>
      <StackItem className="">
        <Button onClick={() => navigation.router({ to: 'mapList' })}>
          View all maps
        </Button>
      </StackItem>
    </>
  );
};
RightToolbar.propTypes = {
  navigation: PropTypes.object
};

export default class ViewMap extends Component {
  static propTypes = {
    map: PropTypes.object,
    navigation: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      //
    };
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

  renderGridItems({
    mapLocations = [],
    entities = [],
    workloadToEntityGuidsLookup = {}
  }) {
    const { map } = this.props;
    const hasMapLocations = mapLocations && mapLocations.length > 0;
    const hasEntities = entities && entities.length > 0;
    const entitiesMap = mapByGuid({ data: entities });

    return (
      <>
        <StackItem fullHeight className="locations-table-stack-item">
          {hasMapLocations && hasEntities && (
            <MapLocationTable
              mapLocations={mapLocations}
              entities={entitiesMap}
              entityToEntitiesLookup={workloadToEntityGuidsLookup}
            />
          )}
          {/* TO DO - What does this table look like without entity alert data ? */}
          {hasMapLocations && !hasEntities && (
            <>
              <MapLocationTable data={mapLocations} />
              <EmptyState
                heading="Map locations but no associated entities"
                description=""
              />
            </>
          )}

          {!hasMapLocations && (
            <EmptyState heading="No map locations found" description="" />
          )}
        </StackItem>
        <StackItem grow className="primary-content-container">
          {hasMapLocations && (
            <GeoMap
              map={map}
              mapLocations={mapLocations}
              entitiesMap={mapByGuid({ entities })}
              // onMarkerClick={marker => console.log(marker)}
              // onMapClick={this.onMapClick}
            />
          )}
          {!hasMapLocations && (
            <EmptyState heading="No map locations found" description="" />
          )}
        </StackItem>
        <StackItem fullHeight className="detail-pane-stack-item">
          <DetailPanel
            title="Detail panel title"
            description="Sed posuere consectetur est at lobortis. Nullam quis risus eget urna mollis."
            onClose={() => console.log('You clicked the close button')}
            onMinimize={() => console.log('You clicked the minimize button')}
          >
            <Tabs>
              <TabsItem value="tab-1" label="Tab 1 label">
                Tab 1 content. Vestibulum id ligula porta felis euismod semper.
              </TabsItem>
              <TabsItem value="tab-2" label="Tab 2 label">
                Tab 2 content. Nulla vitae elit libero, a pharetra augue ligula.
              </TabsItem>
              <TabsItem value="tab-3" label="Tab 3 label">
                Tab 3 content. Integer posuere erat a ante venenatis dapibus.
              </TabsItem>
            </Tabs>
          </DetailPanel>
        </StackItem>
      </>
    );
  }

  render() {
    const { map, navigation } = this.props;

    return (
      <>
        <Toolbar
          className="view-map-toolbar"
          left={<LeftToolbar navigation={navigation} />}
          right={<RightToolbar navigation={navigation} />}
        />
        <Stack
          fullWidth
          gapType={Stack.GAP_TYPE.NONE}
          className="primary-grid view-map-primary-grid"
        >
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

              const hasAssociatedEntities =
                entityGuids && entityGuids.length > 0;

              if (!hasAssociatedEntities) {
                return this.renderGridItems({ mapLocations });
              }

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

                                return (
                                  <EntitiesByGuidsQuery
                                    entityGuids={allEntityGuids}
                                    entityFragmentExtension={
                                      entityFragmentExtension
                                    }
                                    fetchPolicyType={
                                      EntitiesByGuidsQuery.FETCH_POLICY_TYPE
                                        .NO_CACHE
                                    }
                                  >
                                    {({ loading, error, data }) => {
                                      if (loading) {
                                        return (
                                          <Spinner>
                                            Loading all entity data
                                          </Spinner>
                                        );
                                      }

                                      if (error) {
                                        return <NerdGraphError error={error} />;
                                      }

                                      return this.renderGridItems({
                                        mapLocations,
                                        entities: get(data, 'entities'),
                                        workloadToEntityGuidsLookup
                                      });
                                    }}
                                  </EntitiesByGuidsQuery>
                                );
                              }}
                            </NerdGraphQuery>
                          );
                        }}
                      </EntitiesByGuidsQuery>
                    </>
                  )}

                  {!map && <EmptyState />}
                </>
              );
            }}
          </MapLocationQuery>
        </Stack>
      </>
    );
  }
}
