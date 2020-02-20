import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Map, TileLayer, Marker } from 'react-leaflet';
import { Modal, UserStorageMutation } from 'nr1';
import get from 'lodash.get';

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
    onMarkerClick: PropTypes.func,
    onMapClick: PropTypes.func,
    // callbacks: PropTypes.object.isRequired,
    locations: PropTypes.array,
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

  handleMapClick(e) {
    const { onMapClick } = this.props;
    onMapClick({ e });
  }

  handleMarkerClick(e) {
    const { onMarkerClick } = this.props;
    const document = get(e, 'target.options.document', false);
    this.setState({ selectedLocation: document, hidden: false });
    onMarkerClick({ e, document });
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
    const { map, mapLocations, locations } = this.props;
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
              {locations &&
                locations.length > 0 &&
                locations.map(location => {
                  const { document } = location;
                  const { guid, lat, lng } = document;
                  const icon = generateIcon(document);

                  if (!(lat && lng)) {
                    return null;
                  }

                  return (
                    <Marker
                      key={guid}
                      position={[lat, lng]}
                      onClick={this.handleMarkerClick}
                      _did={guid}
                      icon={icon}
                      document={document}
                    />
                  );
                })}
              {mapLocations &&
                mapLocations.length > 0 &&
                mapLocations.map(item => {
                  const { document } = item;
                  const { guid, lat, lng, location } = document;
                  const icon = generateIcon(document);

                  if (!(lat && lng)) {
                    return null;
                  }

                  return (
                    <Marker
                      key={guid}
                      position={[lat, lng]}
                      onClick={this.handleMarkerClick}
                      _did={location}
                      icon={icon}
                      document={document}
                    />
                  );
                })}
            </Map>
          )}
        </div>

        {/* Modals */}
        {/* TODO - Location Detail */}
        {selectedLocation && (
          <Modal
            hidden={hidden}
            onClose={() => this.setState({ hidden: true })}
          >
            <pre>{JSON.stringify(selectedLocation, null, 2)}</pre>
          </Modal>

          // <DetailModal
          //   location={selectedLocation}
          //   hidden={hidden}
          //   callbacks={this.callbacks}
          // />
        )}
      </>
    );
  }
}
