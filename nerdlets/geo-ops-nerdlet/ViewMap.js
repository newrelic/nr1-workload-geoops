import React from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Dropdown,
  DropdownItem,
  Stack,
  StackItem,
  SparklineChart,
  Tabs,
  TabsItem
} from 'nr1';

import { mapByGuid } from '../shared/utils';
import { EmptyState, Timeline } from '@newrelic/nr1-community';

import ViewMapQuery from './ViewMapQuery';
import GeoMap from './geo-map';
import Toolbar from '../shared/components/Toolbar';
import DetailPanel from '../shared/components/DetailPanel';
import MapLocationTable from '../shared/components/MapLocationTable';
import MapLocationDistiller from '../shared/components/MapLocationDistiller';
import AlertsReducer from '../shared/components/AlertsReducer';

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

export default class ViewMap extends React.PureComponent {
  static propTypes = {
    maps: PropTypes.array,
    map: PropTypes.object,
    navigation: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      // TO DO - Increment begin/end time every X seconds, which should cause a full re-render
      /*
        We cannot programmatically interact with the Time Picker
        If the user doesn't explicitly set begin/end with the Time Picker,
        we need to setup something, and change it on an interval or
        our requests for entity alertViolations in <AlertableEntitiesByGuidsQuery> will fail
      */
      begin_time: Date.now() - 60 * 60 * 1000, // 60 min ago
      end_time: Date.now(),

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

  render() {
    const { maps, map, navigation } = this.props;
    const {
      begin_time,
      end_time,
      activeMapLocation,
      detailPanelClosed,
      detailPanelMinimized
    } = this.state;

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
          {map && (
            /*
             * 
                1. ViewMapQuery fetches data through a series of 3 calls:
                    - NerdStorage for MapLocations
                    - Workloads for all attached workloads and their entities
                    - All entities contained in all workloads with alert data
                2. AlertsReducer flattens all alertViolations and recentAlertViolations into one array on the MapLocation
                3. MapLocationDistiller goes through all of a MapLocation's alerting entities and their attached
                  alertViolations and finds the one with the highest severity and adds it to the mapLocation as "mostCriticalEntity"
             *
             */
            <ViewMapQuery map={map} begin_time={begin_time} end_time={end_time}>
              {({
                mapLocations = [],
                entities = [],
                workloadToEntityGuidsLookup = {}
              }) => {
                return (
                  <AlertsReducer
                    mapLocations={mapLocations}
                    entities={entities}
                    workloadToEntityGuidsLookup={workloadToEntityGuidsLookup}
                  >
                    {({
                      mapLocations,
                      entities,
                      workloadToEntityGuidsLookup
                    }) => {
                      const hasMapLocations =
                        mapLocations && mapLocations.length > 0;
                      const hasEntities = entities && entities.length > 0;
                      const entitiesMap = mapByGuid({ data: entities });
                      const test = false;

                      if (!test && !hasMapLocations) {
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

                      return (
                        <>
                          <MapLocationDistiller
                            mapLocations={mapLocations}
                            entities={entitiesMap}
                            entityToEntitiesLookup={workloadToEntityGuidsLookup}
                          >
                            {/* Note: we have multiple variables named mapLocations scoped differently */}
                            {({ data: mapLocations }) => {
                              return (
                                <>
                                  <StackItem
                                    fullHeight
                                    className="locations-table-stack-item"
                                  >
                                    {hasMapLocations && hasEntities && (
                                      <MapLocationTable
                                        data={mapLocations}
                                        map={map}
                                      />
                                    )}
                                    {hasMapLocations && !hasEntities && (
                                      <>
                                        <MapLocationTable
                                          data={mapLocations}
                                          map={map}
                                        />
                                        <EmptyState
                                          heading="Map locations but no associated entities"
                                          description=""
                                        />
                                      </>
                                    )}
                                    {!hasMapLocations &&
                                      this.renderEmptyState()}
                                  </StackItem>
                                  <StackItem
                                    grow
                                    className="primary-content-container"
                                  >
                                    {hasMapLocations && (
                                      <GeoMap
                                        map={map}
                                        mapLocations={mapLocations}
                                        entitiesMap={mapByGuid({
                                          entities
                                        })}
                                        onMarkerClick={mapLocation =>
                                          this.openDetailPanel(mapLocation)
                                        }
                                        onMapClick={() =>
                                          console.log('not a rerender')
                                        }
                                      />
                                    )}
                                    {!hasMapLocations && (
                                      <EmptyState
                                        heading="No map locations found"
                                        description=""
                                      />
                                    )}
                                  </StackItem>
                                  {activeMapLocation && (
                                    <StackItem
                                      fullHeight
                                      className={`detail-panel-stack-item ${
                                        detailPanelClosed ? 'closed' : ''
                                      } ${
                                        detailPanelMinimized ? 'minimized' : ''
                                      }`}
                                    >
                                      <DetailPanel
                                        featuredChart={this.renderFeaturedChart(
                                          map
                                        )}
                                        onClose={
                                          this.handleDetailPanelCloseButton
                                        }
                                        onMinimize={
                                          this.handleDetailPanelMinimizeButton
                                        }
                                        data={activeMapLocation}
                                      >
                                        <Tabs>
                                          <TabsItem
                                            value="tab-1"
                                            label="Location JSON"
                                          >
                                            <pre>
                                              {JSON.stringify(
                                                activeMapLocation,
                                                null,
                                                2
                                              )}
                                            </pre>
                                          </TabsItem>
                                          <TabsItem
                                            value="tab-2"
                                            label="Recent incidents"
                                          >
                                            <small>
                                              Morbi malesuada nulla nec purus
                                              convallis consequat. Vivamus id
                                              mollis quam. Morbi ac commodo
                                              nulla. In condimentum orci id nisl
                                              volutpat bibendum. Quisque commodo
                                              hendrerit lorem quis egestas.
                                              Maecenas quis tortor arcu. Vivamus
                                              rutrum nunc non neque consectetur
                                              quis placerat neque lobortis.
                                            </small>
                                            {/* <Timeline data={activeMapLocation} /> */}
                                          </TabsItem>
                                          <TabsItem
                                            value="tab-3"
                                            label="Metatags & data"
                                          >
                                            <small>
                                              Ut in nulla enim. Phasellus
                                              molestie magna non est bibendum
                                              non venenatis nisl tempor.
                                              Suspendisse dictum feugiat nisl ut
                                              dapibus. Mauris iaculis porttitor
                                              posuere. Praesent id metus massa,
                                              ut blandit odio. Proin quis tortor
                                              orci. Etiam at risus et justo
                                              dignissim congue. Donec congue
                                              lacinia dui, a porttitor lectus
                                              condimentum laoreet. Nunc eu
                                              ullamcorper orci. Quisque eget
                                              odio ac lectus vestibulum faucibus
                                              eget in metus. In pellentesque
                                              faucibus vestibulum. Nulla at
                                              nulla justo, eget luctus tortor.
                                              Nulla facilisi. Duis aliquet
                                              egestas purus in blandit.
                                              Curabitur vulputate, ligula
                                              lacinia scelerisque tempor, lacus
                                              lacus ornare ante, ac egestas est
                                              urna sit amet arcu. Class aptent
                                              taciti sociosqu ad litora torquent
                                              per conubia.
                                            </small>
                                          </TabsItem>
                                          <TabsItem
                                            value="tab-4"
                                            label="Revenue detail"
                                          >
                                            <small>
                                              Nulla quis tortor orci. Etiam at
                                              risus et justo dignissim.
                                            </small>
                                          </TabsItem>
                                        </Tabs>
                                      </DetailPanel>
                                    </StackItem>
                                  )}
                                </>
                              );
                            }}
                          </MapLocationDistiller>
                          )}
                        </>
                      );
                    }}
                  </AlertsReducer>
                );
              }}
            </ViewMapQuery>
          )}
        </Stack>
      </>
    );
  }
}
