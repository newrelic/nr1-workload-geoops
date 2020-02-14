import React, { Component } from 'react';

import {
  Button,
  Dropdown,
  DropdownItem,
  Grid,
  GridItem,
  Spinner,
  StackItem
} from 'nr1';

import { EmptyState } from '@newrelic/nr1-community';

import GeoMap from './geo-map';
// import GeoMapEdit from './geo-map-edit';
import Toolbar from '../shared/components/Toolbar';
import MapLocationTable from '../shared/components/MapLocationTable';

import { nerdStorageRequest } from '../shared/utils';
import { getLocations } from '../shared/services/location';
import { getMapLocations } from '../shared/services/map-location';

// import {
//   getWorkload,
//   getWorkloads,
//   proxyGetWorkloadResponse,
//   proxyGetWorkloadsResponse
// } from '../shared/services/workloads';

const LeftToolbar = () => {
  return (
    <>
      <StackItem className="toolbar-item has-separator">
        <Button>Back to main view</Button>
      </StackItem>
      <StackItem className="toolbar-item has-separator">
        <Dropdown label="Account" title="Choose an Account">
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
      <StackItem className="toolbar-item has-separator">
        Create a map to begin
      </StackItem>
    </>
  );
};

const RightToolbar = () => {
  return (
    <>
      <StackItem className="">
        <Button>New Map</Button>
      </StackItem>
      <StackItem className="">
        <Button>Settings</Button>
      </StackItem>
    </>
  );
};

export default class ViewMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // TO DO - Check on nr1 AccountDropdown, if still too far off, use nr1-community
      accountId: 630060,

      selectedMap: null,

      // Data
      mapLocations: [],

      // Loading
      isLoading: true,
      mapLoading: true,
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

  async loadLocations() {
    const { accountId } = this.state;
    this.setState({ isLoading: true });
    // Locations
    const {
      data: locations,
      errors: locationLoadingErrors
    } = await nerdStorageRequest({
      service: getLocations,
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
      service: getMapLocations,
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
      mapLocations,

      isLoading,
      locationsLoading,
      mapLocationsLoading,
      selectedMap
    } = this.state;

    if (isLoading) {
      return (
        <div className="geoOpsContainer">
          {locationsLoading && <h2>Loading locations...</h2>}
          {mapLocationsLoading && <h2>Loading additional data...</h2>}
          <Spinner />
        </div>
      );
    }

    // console.debug(mapLocations);
    return (
      <>
        <Toolbar left={<LeftToolbar />} right={<RightToolbar />} />;
        <Grid
          className="primary-grid"
          spacingType={[Grid.SPACING_TYPE.NONE, Grid.SPACING_TYPE.NONE]}
        >
          <GridItem
            columnSpan={3}
            fullHeight
            className="locations-table-grid-item"
          >
            <MapLocationTable />
          </GridItem>
          <GridItem className="primary-content-container" columnSpan={9}>
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
                    {/* <GeoMapEdit
                  accountId={accountId}
                  map={selectedMap}
                  locations={locations}
                  callbacks={this.callbacks}
                /> */}
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
          </GridItem>
        </Grid>
      </>
    );
  }
}
