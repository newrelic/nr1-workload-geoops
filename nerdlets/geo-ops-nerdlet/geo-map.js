import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import { Stack, StackItem, Link, Modal, UserStorageMutation } from 'nr1';
import get from 'lodash.get';

// import Data from './data';
// eslint-disable-next-line no-unused-vars
import DetailModal from './detail-modal';
import { generateIcon } from './utils';

// import { getMapLocations } from '../shared/services/map-location';

// import geoopsConfig from '../../geoopsConfig';
// const config = geoopsConfig[0];
// const testMarkers = config.locations;

export default class GeoMap extends Component {
  static propTypes = {
    map: PropTypes.object.isRequired,
    onMarkerClick: PropTypes.func,
    onMapClick: PropTypes.func,
    mapLocations: PropTypes.array,

    // Leaflet pass-throughs
    center: PropTypes.array,
    zoom: PropTypes.number
  };

  constructor(props) {
    super(props);
    this.state = {
      map: props.map,
      data: [],
      errors: [],
      selectedLocation: null,
      favorites: []
    };

    this.setData = this.setData.bind(this);
    this.setFavorite = this.setFavorite.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleMapClick = this.handleMapClick.bind(this);
    this.handleMarkerClick = this.handleMarkerClick.bind(this);

    // this.dataProcess = new Data({
    //   demoMode: true,
    //   mapGuid: this.state.configId,
    //   refreshTimeout: 60000,
    //   callbacks: this.callbacks
    // });
  }

  componentWillUnmount() {
    if (this.dataProcess) {
      this.dataProcess.stop();
    }
  }

  setFavorite(id) {
    const { data, favorites } = this.state;
    let newFavorites = [];
    const favorite = favorites.find(f => f === id);
    if (favorite) {
      newFavorites = favorites.filter(f => f !== id);
    } else {
      newFavorites.push(id);
    }
    // eslint-disable-next-line no-console
    console.debug(`Writing ${favorites}`);
    UserStorageMutation.mutate({
      actionType: UserStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
      collection: 'v0-infra-geoops',
      documentId: 'favorites',
      document: { favorites }
    });
    const selectedLocation = data.find(l => l.id === id);
    selectedLocation.favorite = !selectedLocation.favorite;
    // console.debug(`Setting location ${id} to a favorite status of ${selectedLocation.favorite}`)
    this.setState({ data, favorites: newFavorites });
  }

  setData(data, favorites) {
    // console.debug("Setting data", data);
    this.setState({ data, favorites: favorites || [] });
  }

  handleMapClick(e) {
    const { onMapClick } = this.props;
    onMapClick(e);
  }

  handleMarkerClick(e, mapLocation) {
    const { onMarkerClick } = this.props;
    const document = get(e, 'target.options.document', false);
    this.setState({ selectedLocation: document, hidden: false });
    onMarkerClick(mapLocation);
  }

  handleMarkerHover() {
    event.relatedTarget.classList.add('active');
  }

  closeModal() {
    this.setState({ hidden: true, selectedLocation: null });
  }

  render() {
    const { map, mapLocations, zoom } = this.props;
    const { errors, hidden, selectedLocation } = this.state;
    const hasErrors = (errors && errors.length > 0) || false;

    const startingCenter =
      map.lat && map.lng
        ? [map.lat, map.lng]
        : false ||
          (map.lat && map.lng ? [map.lat, map.lng] : [10.5731, -7.5898]);
    const startingZoom = zoom || map.zoom || 3;

    return (
      <>
        {/* <h1>{map.title}</h1> */}
        <div className="leaflet-wrapper">
          {hasErrors && <pre>{JSON.stringify(errors, null, 2)}</pre>}
          {!hasErrors && (
            <Map
              center={startingCenter}
              zoomControl
              zoom={startingZoom}
              onClick={this.handleMapClick}
            >
              <TileLayer
                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {mapLocations &&
                mapLocations.length > 0 &&
                mapLocations.map(item => {
                  const { document: mapLocation } = item;
                  const { guid, location = false } = mapLocation;

                  if (!location) {
                    return null;
                  }

                  const { lat, lng } = location;

                  if (!(lat && lng)) {
                    return null;
                  }
                  const icon = generateIcon(mapLocation);
                  return (
                    <Marker
                      key={guid}
                      position={[lat, lng]}
                      onClick={() => this.handleMarkerClick(event, mapLocation)}
                      _did={mapLocation}
                      icon={icon}
                      document={mapLocation}
                      riseOnHover
                      onMouseOver={e => {
                        e.target.openPopup();
                      }}
                      onMouseOut={e => {
                        e.target.closePopup();
                      }}
                    >
                      <Popup>
                        <Stack
                          className="marker-popup-header"
                          directionType={Stack.DIRECTION_TYPE.HORIZONTAL}
                          fullWidth
                        >
                          <StackItem className="marker-popup-status-dot-container">
                            <span className="marker-popup-status-dot" />
                          </StackItem>
                          <StackItem
                            className="marker-popup-title-container"
                            grow
                          >
                            {/* <span className="marker-popup-title-label">
                              Store:
                            </span>{' '} */}
                            <span className="marker-popup-title">
                              {mapLocation.title}
                            </span>
                          </StackItem>{' '}
                          <StackItem className="marker-popup-comparison-container">
                            <span className="marker-popup-comparison">
                              1.04%
                            </span>
                          </StackItem>
                        </Stack>
                        <p className="marker-popup-description">
                          {mapLocation.location.description
                            ? mapLocation.location.description
                            : 'No description.'}
                          <Link>View workload</Link>
                        </p>
                      </Popup>
                    </Marker>
                  );
                })}
            </Map>
          )}
        </div>
      </>
    );
  }
}
