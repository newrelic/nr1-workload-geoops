import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import { Stack, StackItem, Link, Icon, navigation } from 'nr1';
import get from 'lodash.get';

import BatchNrql from '../shared/components/BatchNrql';
import { generateIcon, statusColor } from './utils';

export default class GeoMap extends Component {
  static propTypes = {
    map: PropTypes.object,
    onMarkerClick: PropTypes.func,
    onMapClick: PropTypes.func,
    onZoomEnd: PropTypes.func,
    mapLocations: PropTypes.array,

    // Leaflet pass-throughs
    center: PropTypes.array,
    zoom: PropTypes.number,
    activeMapLocation: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      errors: [],
      mapReady: false,
      queries: [],
      selectedLocation: '',
      popupIsHovered: false,
      hoveredMarker: null
    };

    this.popupHoverTimer = null;

    this.mapRef = React.createRef();
    this.handleMapClick = this.handleMapClick.bind(this);
    this.handleMarkerClick = this.handleMarkerClick.bind(this);
    this.handleOnZoomEnd = this.handleOnZoomEnd.bind(this);
    this.handleMarkerMouseOver = this.handleMarkerMouseOver.bind(this);
    this.handleMarkerMouseOut = this.handleMarkerMouseOut.bind(this);
    this.handlePopupMouseOver = this.handlePopupMouseOver.bind(this);
    this.handlePopupMouseOut = this.handlePopupMouseOut.bind(this);
  }

  componentDidMount() {
    this.mapQueries();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.mapLocations !== this.props.mapLocations) {
      // console.log('mapLocations changed');
      this.mapQueries();
    }

    if (this.state.popupIsHovered) {
      clearTimeout(this.popupHoverTimer);
    }

    if (prevProps.activeMapLocation !== this.props.activeMapLocation) {
      this.setSelectedLocation();
    }
  }

  setSelectedLocation() {
    this.setState({ selectedLocation: this.props.activeMapLocation.guid });
  }

  mapQueries() {
    const { mapLocations } = this.props;

    if (!mapLocations) {
      return;
    }

    const queries = mapLocations.reduce((p, i) => {
      if (i.query) {
        p.push({
          key: i.guid,
          query: i.query
        });
      }
      return p;
    }, []);
    this.setState({ queries });
  }

  handleMapClick(e) {
    const { onMapClick } = this.props;
    if (onMapClick) {
      onMapClick(e);
    }
  }

  handleOnZoomEnd(e) {
    const { onZoomEnd = false } = this.props;
    if (onZoomEnd) {
      onZoomEnd(e);
    }
  }

  handleMarkerClick(e) {
    // e.originalEvent.view.L.DomEvent.stopPropagation(e);
    // e.originalEvent.preventDefault();
    // e.originalEvent.stopPropagation();

    const mapLocation = e.sourceTarget.options.document;
    const { onMarkerClick } = this.props;
    this.setState({ selectedLocation: mapLocation.guid });

    if (onMarkerClick) {
      onMarkerClick(mapLocation);
    }
  }

  handleMarkerHover() {
    event.relatedTarget.classList.add('active');
  }

  calculateCenter() {
    const { center, map } = this.props;

    let startingCenter = center ? center.lat && center.lng : false;
    if (!startingCenter && map) {
      startingCenter = map.lat && map.lng ? [map.lat, map.lng] : false;
    }
    if (!startingCenter) {
      startingCenter = [10.5731, -7.5898];
    }

    return startingCenter;
  }

  handleMarkerMouseOver(e) {
    if (this.popupHoverTimer) {
      clearTimeout(this.popupHoverTimer);
    }
    e.target.openPopup();
  }

  handleMarkerMouseOut(e) {
    this.setState({ hoveredMarker: e.target });
    this.popupHoverTimer = setTimeout(() => {
      this.state.hoveredMarker.closePopup();
    }, 150);
  }

  handlePopupMouseOver() {
    clearTimeout(this.popupHoverTimer);
    this.setState({ popupIsHovered: true });
  }

  handlePopupMouseOut() {
    this.popupHoverTimer = setTimeout(() => {
      this.state.hoveredMarker.closePopup();
    }, 150);
  }

  renderEntityLink(mapLocation) {
    const location = navigation.getOpenStackedEntityLocation(
      mapLocation.entities[0].guid
    );
    return (
      <Link to={location} className="view-workload-button detail-pane-cta">
        View in Workloads
        <Icon
          type={Icon.TYPE.INTERFACE__CHEVRON__CHEVRON_RIGHT__SIZE_8}
          color="#0079bf"
        />
      </Link>
    );
  }

  renderMarkers() {
    const { map, mapLocations } = this.props;
    const { mapReady, queries, selectedLocation } = this.state;

    const leafletElement = get(this.mapRef, 'current.leafletElement', false);
    const bounds =
      mapReady && leafletElement ? leafletElement.getBounds() : false;

    const queryPrefix = 'Q';

    return (
      <BatchNrql
        accountId={map.accountId}
        queries={queries}
        queryPrefix={queryPrefix}
      >
        {({ queryResults }) => {
          return mapLocations.map(item => {
            const mapLocation = item.document ? item.document : item;
            const { guid, location = false } = mapLocation;

            if (!location) {
              return null;
            }

            let { lat, lng } = location;

            if (!(lat && lng)) {
              return null;
            }

            // TO DO - Why are some strings and others numbers?
            // We need to sync-up and ensure we're appropriately converting these before they get to this component...
            if (typeof lat === 'string' || typeof lng === 'string') {
              lat = parseFloat(lat);
              lng = parseFloat(lng);
            }

            if (leafletElement && bounds) {
              const latLngBounds = [lat, lng];
              const inBounds = bounds.contains(latLngBounds);

              if (!inBounds) {
                return null;
              }
            }

            const isSelectedIcon = mapLocation.guid === selectedLocation;

            const icon = generateIcon(mapLocation, isSelectedIcon);

            // Lookup the result
            const queryName = queryPrefix + guid.replace(/-/gi, '');
            const queryResult = queryResults[queryName];
            // console.log(`Query result for: ${queryName}`);
            // console.log(queryResult);

            const markerComparisonNumber = queryResult || 'N/A';

            return (
              <Marker
                key={guid}
                position={[lat, lng]}
                onClick={this.handleMarkerClick}
                icon={icon}
                document={mapLocation}
                riseOnHover
                onMouseOver={e => this.handleMarkerMouseOver(e)}
                onMouseOut={e => this.handleMarkerMouseOut(e)}
              >
                <Popup>
                  <div
                    onMouseEnter={e => {
                      e.stopPropagation();
                      this.handlePopupMouseOver();
                    }}
                    onMouseLeave={this.handlePopupMouseOut}
                  >
                    <Stack
                      className="marker-popup-header"
                      directionType={Stack.DIRECTION_TYPE.HORIZONTAL}
                      fullWidth
                    >
                      <StackItem className="marker-popup-status-dot-container">
                        <span
                          className="marker-popup-status-dot"
                          style={{
                            backgroundColor: statusColor(mapLocation)
                          }}
                        />
                      </StackItem>
                      <StackItem className="marker-popup-title-container" grow>
                        {/* <span className="marker-popup-title-label">
                          Store:
                        </span>{' '} */}
                        <span className="marker-popup-title">
                          {mapLocation.title}
                        </span>
                      </StackItem>{' '}
                      <StackItem className="marker-popup-comparison-container">
                        <span className="marker-popup-comparison">
                          {typeof markerComparisonNumber === 'number'
                            ? `${markerComparisonNumber.toFixed(2)}%`
                            : markerComparisonNumber}
                        </span>
                      </StackItem>
                    </Stack>
                    <p className="marker-popup-description">
                      {mapLocation.location.description
                        ? mapLocation.location.description
                        : 'No description.'}
                    </p>
                    {mapLocation && this.renderEntityLink(mapLocation)}
                  </div>
                </Popup>
              </Marker>
            );
          });
        }}
      </BatchNrql>
    );
  }

  render() {
    const { map, mapLocations, zoom } = this.props;
    const { mapReady, errors } = this.state;
    const hasErrors = (errors && errors.length > 0) || false;

    const startingCenter = this.calculateCenter();
    const startingZoom = zoom || map.zoom || 3;

    const renderMarkers = mapReady && mapLocations && mapLocations.length > 0;

    return (
      <>
        {/* <h1>{map.title}</h1> */}
        <div className="leaflet-wrapper">
          {hasErrors && <pre>{JSON.stringify(errors, null, 2)}</pre>}
          {!hasErrors && (
            <Map
              ref={this.mapRef}
              center={startingCenter}
              zoomControl
              zoom={startingZoom}
              onClick={this.handleMapClick}
              onZoomEnd={this.handleOnZoomEnd}
              whenReady={() => this.setState({ mapReady: true })}
            >
              <TileLayer
                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {renderMarkers && this.renderMarkers()}
            </Map>
          )}
        </div>
      </>
    );
  }
}
