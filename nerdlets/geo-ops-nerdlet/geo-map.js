import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Map, TileLayer, Marker } from 'react-leaflet';
import { UserStorageMutation } from 'nr1';

import Data from './data';
// eslint-disable-next-line no-unused-vars
import DetailModal from './detail-modal';
import { generateIcon } from './utils';

import { getMapLocations } from '../shared/services/map-location';

// import geoopsConfig from '../../geoopsConfig';
// const config = geoopsConfig[0];
// const testMarkers = config.locations;

export default class GeoMap extends Component {
  static propTypes = {
    accountId: PropTypes.number.isRequired,
    map: PropTypes.object.isRequired,
    callbacks: PropTypes.object.isRequired,
    mapLocations: PropTypes.array
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

    this.callbacks = {
      setData: this.setData.bind(this),
      onClick: this.onClick.bind(this),
      setFavorite: this.setFavorite.bind(this),
      closeModal: this.closeModal.bind(this)
    };

    this.dataProcess = new Data({
      demoMode: true,
      mapGuid: this.state.configId,
      refreshTimeout: 60000,
      callbacks: this.callbacks
    });
  }

  async componentDidMount() {
    await this.loadMapLocations();
  }

  async componentDidUpdate(prevProps) {
    if (
      prevProps.map !== this.props.map ||
      prevProps.accountId !== this.props.accountId
    ) {
      await this.loadMapLocations();
    }
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

  onClick(selectedLocation) {
    this.setState({ selectedLocation, hidden: false });
  }

  closeModal() {
    this.setState({ hidden: true, selectedLocation: null });
  }

  async loadMapLocations() {
    const { accountId, map } = this.props;
    // console.log(accountId);
    const { data, errors } = await getMapLocations({
      accountId,
      mapGuid: map.guid
    });

    this.setState({ data, errors });
  }

  render() {
    const { map, callbacks, mapLocations } = this.props;
    const { errors, hidden, selectedLocation } = this.state;
    const hasErrors = (errors && errors.length > 0) || false;

    const startingCenter =
      map.centerLat && map.centerLng
        ? [map.centerLat, map.centerLng]
        : [10.5731, -7.5898];
    const startingZoom = map.zoom || 2;
    // debugger;

    return (
      <>
        <h1>{map.title}</h1>
        <div className="leaflet-wrapper">
          {hasErrors && <pre>{JSON.stringify(errors, null, 2)}</pre>}
          {!hasErrors && (
            <Map center={startingCenter} zoomControl zoom={startingZoom}>
              <TileLayer
                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {mapLocations.length > 0 &&
                mapLocations.map(row => {
                  const icon = generateIcon(row);
                  return (
                    <Marker
                      key={row.id}
                      position={[row.lat, row.lng]}
                      onClick={() => {
                        callbacks.onClick(row);
                      }}
                      _did={row.locationId}
                      icon={icon}
                    />
                  );
                })}
            </Map>
          )}
        </div>

        {/* Modals */}
        {/* TODO - Location Detail */}
        {selectedLocation && (
          <DetailModal
            location={selectedLocation}
            hidden={hidden}
            callbacks={this.callbacks}
          />
        )}
      </>
    );
  }
}
