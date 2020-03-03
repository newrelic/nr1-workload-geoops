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
  SparklineChart,
  Tabs,
  TabsItem
} from 'nr1';

import { EmptyState, NerdGraphError } from '@newrelic/nr1-community';

import GeoMap from './geo-map';
import Toolbar from '../shared/components/Toolbar';
import DetailPanel from '../shared/components/DetailPanel';
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

const LeftToolbar = ({ maps, map, navigation }) => {
  return (
    <>
      <StackItem className="toolbar-item">
        <Dropdown label="Map" title={map ? map.title : 'Choose a map'}>
          {maps.map(m => {
            if (!m.document.guid) {
              return null;
            }

            return (
              <DropdownItem
                key={m.document.guid}
                onClick={() =>
                  navigation.router({
                    to: 'viewMap',
                    state: { selectedMap: m.document }
                  })
                }
              >
                {m.document.title}
              </DropdownItem>
            );
          })}
        </Dropdown>
      </StackItem>
    </>
  );
};
LeftToolbar.propTypes = {
  maps: PropTypes.array,
  map: PropTypes.object,
  navigation: PropTypes.object
};

const RightToolbar = ({ navigation }) => {
  return (
    <>
      <StackItem className="">
        <Button
          type={Button.TYPE.NORMAL}
          onClick={() => navigation.router({ to: 'createMap' })}
          iconType={Button.ICON_TYPE.INTERFACE__SIGN__PLUS}
        >
          New Map
        </Button>
      </StackItem>
      <StackItem className="">
        <Button
          type={Button.TYPE.NORMAL}
          onClick={() => navigation.router({ to: 'mapList' })}
          iconType={Button.ICON_TYPE.LOCATION__LOCATION__MAP}
        >
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
    maps: PropTypes.array,
    map: PropTypes.object,
    navigation: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      detailPanelMinimized: false,
      detailPanelClosed: true,
      activeMapLocation: null
    };

    this.handleDetailPanelMinimizeButton = this.handleDetailPanelMinimizeButton.bind(
      this
    );
    this.handleDetailPanelCloseButton = this.handleDetailPanelCloseButton.bind(
      this
    );
    this.openDetailPanel = this.openDetailPanel.bind(this);
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

  openDetailPanel(mapLocation) {
    this.setState({
      detailPanelClosed: false,
      activeMapLocation: mapLocation,
      detailPanelMinimized: false
    });
  }

  handleDetailPanelCloseButton() {
    this.setState({ detailPanelClosed: true });
  }

  handleDetailPanelMinimizeButton() {
    this.setState(prevState => ({
      detailPanelMinimized: !prevState.detailPanelMinimized
    }));
  }

  renderFeaturedChart(map) {
    return (
      <>
        <Stack
          fullWidth
          className="detail-panel-featured-chart-header-container"
        >
          <StackItem grow>
            <h6 className="detail-panel-featured-chart-header">
              Revenue overview
            </h6>
          </StackItem>
          <StackItem>
            <span className="detail-panel-featured-chart-comparison-stat negative">
              14.5%
            </span>
          </StackItem>
        </Stack>
        <SparklineChart
          accountId={map.accountId}
          query="SELECT count(*) FROM `Synthetics` SINCE 1 MONTH AGO TIMESERIES AUTO FACET error"
        />
      </>
    );
  }

  renderEmptyState() {
    const { map, navigation } = this.props;
    return (
      <EmptyState
        heading="No map locations found"
        description=""
        buttonText="Add Locations"
        buttonOnClick={() => {
          navigation.router({
            to: 'createMap',
            state: { selectedMap: map, activeStep: 2 }
          });
        }}
      />
    );
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
    const { detailPanelClosed, detailPanelMinimized } = this.state;

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

          {!hasMapLocations && this.renderEmptyState()}
        </StackItem>
        <StackItem grow className="primary-content-container">
          {hasMapLocations && (
            <GeoMap
              map={map}
              mapLocations={mapLocations}
              entitiesMap={mapByGuid({ entities })}
              onMarkerClick={mapLocation => this.openDetailPanel(mapLocation)}
              // onMapClick={this.onMapClick}
            />
          )}
          {!hasMapLocations && (
            <EmptyState heading="No map locations found" description="" />
          )}
        </StackItem>
        <StackItem
          fullHeight
          className={`detail-panel-stack-item ${
            detailPanelClosed ? 'closed' : ''
          } ${detailPanelMinimized ? 'minimized' : ''}`}
        >
          <DetailPanel
            featuredChart={this.renderFeaturedChart(map)}
            onClose={this.handleDetailPanelCloseButton}
            onMinimize={this.handleDetailPanelMinimizeButton}
            data={this.state.activeMapLocation}
          >
            <Tabs>
              <TabsItem value="tab-1" label="Location JSON">
                <pre>
                  {JSON.stringify(this.state.activeMapLocation, null, 2)}
                </pre>
              </TabsItem>
              <TabsItem value="tab-2" label="Recent incidents">
                <small>
                  Morbi malesuada nulla nec purus convallis consequat. Vivamus
                  id mollis quam. Morbi ac commodo nulla. In condimentum orci id
                  nisl volutpat bibendum. Quisque commodo hendrerit lorem quis
                  egestas. Maecenas quis tortor arcu. Vivamus rutrum nunc non
                  neque consectetur quis placerat neque lobortis.
                </small>
              </TabsItem>
              <TabsItem value="tab-3" label="Metatags & data">
                <small>
                  Ut in nulla enim. Phasellus molestie magna non est bibendum
                  non venenatis nisl tempor. Suspendisse dictum feugiat nisl ut
                  dapibus. Mauris iaculis porttitor posuere. Praesent id metus
                  massa, ut blandit odio. Proin quis tortor orci. Etiam at risus
                  et justo dignissim congue. Donec congue lacinia dui, a
                  porttitor lectus condimentum laoreet. Nunc eu ullamcorper
                  orci. Quisque eget odio ac lectus vestibulum faucibus eget in
                  metus. In pellentesque faucibus vestibulum. Nulla at nulla
                  justo, eget luctus tortor. Nulla facilisi. Duis aliquet
                  egestas purus in blandit. Curabitur vulputate, ligula lacinia
                  scelerisque tempor, lacus lacus ornare ante, ac egestas est
                  urna sit amet arcu. Class aptent taciti sociosqu ad litora
                  torquent per conubia.
                </small>
              </TabsItem>
              <TabsItem value="tab-4" label="Revenue detail">
                <small>
                  Nulla quis tortor orci. Etiam at risus et justo dignissim.
                </small>
              </TabsItem>
            </Tabs>
          </DetailPanel>
        </StackItem>
      </>
    );
  }

  render() {
    const { maps, map, navigation } = this.props;

    return (
      <>
        <Toolbar
          className="view-map-toolbar"
          left={<LeftToolbar navigation={navigation} maps={maps} map={map} />}
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

                  {!map && this.renderEmptyState()}
                </>
              );
            }}
          </MapLocationQuery>
        </Stack>
      </>
    );
  }
}
