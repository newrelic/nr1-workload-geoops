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
  TabsItem,
  Icon,
  navigation
} from 'nr1';

import { mapByGuid } from '../shared/utils';
import { EmptyState } from '@newrelic/nr1-community';
import { lowerCase, kebabCase } from 'lodash';
import { format } from 'date-fns';
import { PACKAGE_UUID } from '../shared/constants';

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

  renderMiniTimline() {
    const { activeMapLocation } = this.state;

    const iconType = alertSeverity => {
      switch (alertSeverity) {
        case 'CRITICAL':
          return Icon.TYPE
            .HARDWARE_AND_SOFTWARE__SOFTWARE__APPLICATION__S_ERROR;
        case 'WARNING':
          return Icon.TYPE
            .HARDWARE_AND_SOFTWARE__SOFTWARE__APPLICATION__S_WARNING;
        case 'NOT_ALERTING':
          return Icon.TYPE
            .HARDWARE_AND_SOFTWARE__SOFTWARE__APPLICATION__A_CHECKED;
        case 'NOT_CONFIGURED':
          return Icon.TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__APPLICATION__S_OK;
      }
    };
    const iconColor = alertSeverity => {
      switch (alertSeverity) {
        case 'CRITICAL':
          return '#BF0016';
        case 'WARNING':
          return '#9C5400';
        case 'NOT_ALERTING':
          return '#3CA653';
        case 'NOT_CONFIGURED':
          return '#464e4e';
      }
    };

    const timelineItems = activeMapLocation.recentViolations.map(violation => {
      return (
        <div
          className={`timeline-item impact-${kebabCase(
            violation.alertSeverity
          )}`}
          key={violation.violationId}
          onClick={() => {
            navigation.openStackedNerdlet({
              id: `${PACKAGE_UUID}.recent-incidents`,
              urlState: {
                recentViolations: activeMapLocation.recentViolations,
                clickedViolation: violation
              }
            });
          }}
        >
          <div className="timeline-item-timestamp">
            <span className="timeline-timestamp-date">
              {format(violation.openedAt, 'MM/dd/yy')}
            </span>
            <span className="timeline-timestamp-time">
              {format(violation.openedAt, 'p')}
            </span>
          </div>
          <div className="timeline-item-dot" />
          <div className="timeline-item-body">
            <div className="timeline-item-body-header">
              <div
                className="timeline-item-symbol"
                title={`Impact: ${lowerCase(violation.alertSeverity)}`}
              >
                <Icon
                  type={iconType(violation.alertSeverity)}
                  color={iconColor(violation.alertSeverity)}
                />
              </div>
              <div className="timeline-item-title">{violation.label}</div>
            </div>
          </div>
        </div>
      );
    });

    return (
      <div className="timeline-container mini-timeline">{timelineItems}</div>
    );
  }

  renderMetadata() {
    const { activeMapLocation } = this.state;

    const keys = Object.keys(activeMapLocation);

    const items = keys.map(key => {
      if (typeof activeMapLocation[key] !== 'object') {
        return (
          <li key={key} className="detail-panel-metadata-item">
            <Stack fullWidth>
              <StackItem className="detail-panel-metadata-item-key" title={key}>
                {key}
              </StackItem>
              <StackItem
                grow
                className="detail-panel-metadata-item-value"
                title={activeMapLocation[key]}
              >
                {activeMapLocation[key]}
              </StackItem>
            </Stack>
          </li>
        );
      } else if (key === 'location') {
        const locationKeys = Object.keys(activeMapLocation[key]);

        return locationKeys.map(locationKey => {
          return (
            <li key={locationKey} className="detail-panel-metadata-item">
              <Stack fullWidth>
                <StackItem
                  className="detail-panel-metadata-item-key"
                  title={locationKey}
                >
                  {locationKey}
                </StackItem>
                <StackItem
                  grow
                  className="detail-panel-metadata-item-value"
                  title={activeMapLocation[key][locationKey]}
                >
                  {activeMapLocation[key][locationKey]}
                </StackItem>
              </Stack>
            </li>
          );
        });
      } else {
        return '';
      }
    });

    return <ul className="detail-panel-metadata-list">{items}</ul>;
  }

  renderTags() {
    const { activeMapLocation } = this.state;

    const items = activeMapLocation.tags.map((tag, index) => {
      return (
        <div key={index} className="detail-panel-metadata-item">
          <span className="tag-key">{tag.key}:</span>
          <span className="tag-value">{tag.value}</span>
        </div>
      );
    });

    return items;
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
                                          label="Recent incidents"
                                          className="no-padding"
                                        >
                                          {activeMapLocation ? (
                                            this.renderMiniTimline()
                                          ) : (
                                            <></>
                                          )}
                                        </TabsItem>
                                        <TabsItem
                                          value="tab-2"
                                          label="Metadata & tags"
                                          className="no-padding"
                                        >
                                          {activeMapLocation ? (
                                            this.renderMetadata()
                                          ) : (
                                            <></>
                                          )}
                                          {/* {activeMapLocation &&
                                            this.renderTags()} */}
                                        </TabsItem>
                                        <TabsItem
                                          value="tab-3"
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
                                </>
                              );
                            }}
                          </MapLocationDistiller>
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
