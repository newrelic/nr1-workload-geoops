import React, { Component } from 'react';

import { Grid, GridItem, Spinner } from 'nr1';

import { EmptyState } from '@newrelic/nr1-community';

import GeoMap from './geo-map';
import GeoMapEdit from './geo-map-edit';
import { nerdStorageRequest } from '../shared/utils';

import { getMaps } from '../shared/services/map';
import { getLocations } from '../shared/services/location';
import { getMapLocations } from '../shared/services/map-location';

// import { getWorkload, getWorkloads } from '../shared/services/workloads';

export default class GeoOpsNerdlet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // TO DO - Check on nr1 AccountDropdown, if still too far off, use nr1-community
      accountId: 630060,

      selectedMap: null,

      // Data
      maps: [],
      locations: [],
      mapLocations: [],

      // Loading
      isLoading: true,
      mapsLoading: true,
      locationsLoading: true,
      mapLocationsLoading: true,

      // Errors
      mapLoadingErrors: [],
      locationLoadingErrors: [],
      mapLocationLoadingErrors: []
    };

    this.callbacks = {
      setParentState: this.setParentState.bind(this),
      onMapLocationChange: this.onMapLocationChange.bind(this)
    };
  }

  async componentDidMount() {
    await this.load();
  }

  async loadMaps({ userSettings }) {
    const { accountId } = this.state;
    this.setState({ isLoading: true });

    // Maps
    const { data: maps, errors: mapLoadingErrors } = await nerdStorageRequest({
      dataFetcher: getMaps,
      errorState: 'loadingMaps',
      params: { accountId }
    });

    // Favor user's default map setting over the first map found
    const userDefaultMap = userSettings.defaultMapGuid
      ? [].find(m => m.document.guid === userSettings.defaultMapGuid)
      : false;
    const selectedMap = userDefaultMap || maps[0].document;

    this.setState({
      mapsLoading: false,
      maps,
      mapLoadingErrors,
      selectedMap
    });
  }

  async loadLocations() {
    const { accountId } = this.state;
    this.setState({ isLoading: true });
    // Locations
    const {
      data: locations,
      errors: locationLoadingErrors
    } = await nerdStorageRequest({
      dataFetcher: getLocations,
      errorState: 'loadingLocations',
      params: { accountId, fixtureData: true }
    });

    this.setState({
      locationsLoading: false,
      locations,
      locationLoadingErrors
    });
  }

  async loadMapLocations() {
    const { accountId } = this.state;
    this.setState({ isLoading: true });

    // Map Locations
    const {
      data: mapLocations,
      errors: mapLocationLoadingErrors
    } = await nerdStorageRequest({
      dataFetcher: getMapLocations,
      errorState: 'loadingMapLocations',
      params: { accountId }
    });

    this.setState({
      mapLocationsLoading: false,
      mapLocations,
      mapLocationLoadingErrors
    });
  }

  async load() {
    this.setState({ isLoading: true });

    // TO DO
    // Fetch user default settings, like which map to start with
    const userSettings = {
      defaultMapGuid: false
    };

    await this.loadMaps({ userSettings });
    await this.loadLocations();
    await this.loadMapLocations();

    // TO DO - Move this into the <GeoMap> component, this should get loaded by looking at each MapLocation's "related entities"
    // const workloads = await getWorkloads({ accountId });
    // console.debug(workloads);
    // const workload = await getWorkload({
    //   accountId,
    //   id: 48,
    //   fixtureData: true
    // });
    // debugger;

    this.setState({ isLoading: false });
  }

  setParentState(state) {
    this.setState({ ...state });
  }

  onMapLocationChange({ document }) {
    const { mapLocations } = this.state;

    // TO DO - slice and add new document

    this.setState({
      mapLocations: [...mapLocations, document]
    });
  }

  renderErrors() {
    const {
      mapLoadingErrors,
      locationLoadingErrors,
      mapLocationLoadingErrors
    } = this.state;

    const errors = [
      ...(mapLoadingErrors || []),
      ...(locationLoadingErrors || []),
      ...(mapLocationLoadingErrors || [])
    ];

    if (errors.length === 0) {
      return null;
    }
    return <pre>{JSON.stringify(errors, null, 2)}</pre>;
  }

  render() {
    const {
      accountId,
      maps,
      locations,
      mapLocations,

      isLoading,
      mapsLoading,
      locationsLoading,
      mapLocationsLoading,
      selectedMap
    } = this.state;

    if (isLoading) {
      return (
        <div className="geoOpsContainer">
          {mapsLoading && <h2>Loading maps...</h2>}
          {locationsLoading && <h2>Loading locations...</h2>}
          {mapLocationsLoading && <h2>Loading additional data...</h2>}
          <Spinner />
        </div>
      );
    }

    // console.debug(mapLocations);
    return (
      <>
        <Grid className="primary-grid">
          <GridItem
            columnSpan={12}
            collapseGapBefore
            collapseGapAfter
            className="gridItem"
          >
            {this.renderErrors()}

            {selectedMap && (
              <>
                <GeoMapEdit
                  accountId={accountId}
                  map={selectedMap}
                  maps={maps}
                  locations={locations}
                  callbacks={this.callbacks}
                />
                <GeoMap
                  accountId={accountId}
                  map={selectedMap}
                  mapLocations={mapLocations}
                  callbacks={this.callbacks}
                />
              </>
            )}

            {!selectedMap && <EmptyState />}
          </GridItem>
        </Grid>
      </>
    );
  }
}
