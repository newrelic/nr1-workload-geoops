/*
 * Copyright 2019 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Grid,
  GridItem,
  Modal,
  Spinner,
  UserStorageMutation
} from 'nr1';

import { EmptyState } from '@newrelic/nr1-community';

import Toolbar from '../shared/components/toolbar';
import JsonSchemaForm from '../shared/components/json-schema-form';
import PoSMap from './pos-map';
import Data from './data';
import DetailModal from './detail-modal';
// import LocationTable from './location-table';

// import geoopsConfig from '../../geoopsConfig';

import {
  MAP_JSON_SCHEMA,
  MAP_DEFAULTS,
  LOCATION_JSON_SCHEMA,
  MAP_LOCATION_JSON_SCHEMA
} from '../shared/constants';
import { getMaps, getMap, writeMap } from '../shared/services/map';

export default class GeoOpsNerdlet extends Component {
  static propTypes = {
    launcherUrlState: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      // TO DO - Check on nr1 AccountDropdown, if still too far off, use nr1-community
      accountId: 630060,
      // configId: geoopsConfig[0].id,
      data: null,
      hidden: true,
      location: null,
      favorites: [],
      maps: [],
      selectedMap: null,
      addMapModal: false,
      addLocationModal: false,
      addMapLocationModal: false,
      editMapModal: false
    };

    this.callbacks = {
      onClick: this.onClick.bind(this),
      setData: this.setData.bind(this),
      setFavorite: this.setFavorite.bind(this),
      closeModal: this.closeModal.bind(this),
      setParentState: this.setParentState.bind(this),
      onAddEditMap: this.onAddEditMap.bind(this)
    };

    this.dataProcess = new Data({
      demoMode: true,
      mapGuid: this.state.configId,
      refreshTimeout: 60000,
      callbacks: this.callbacks
    });
  }

  async componentDidMount() {
    await this.loadMaps();
  }

  componentWillUnmount() {
    if (this.dataProcess) {
      this.dataProcess.stop();
    }
  }

  setParentState(state) {
    console.log(state);
    this.setState({ ...state });
  }

  async loadMaps() {
    const { accountId } = this.state;
    // TO DO
    // Fetch user default settings, like which map to start with

    // Fetch Maps, defaulting to the first one
    const { data, errors } = await getMaps({ accountId });
    const maps = data;

    if (errors) {
      console.log('Errors fetching maps');
      console.log(errors);
    }

    console.log(maps);

    this.setState({
      maps,
      selectedMap: maps[0].document
    });
  }

  closeModal() {
    this.setState({ hidden: true, location: null });
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
    const location = data.find(l => l.id === id);
    location.favorite = !location.favorite;
    // console.debug(`Setting location ${id} to a favorite status of ${location.favorite}`)
    this.setState({ data, favorites: newFavorites });
  }

  setData(data, favorites) {
    // console.debug("Setting data", data);
    this.setState({ data, favorites: favorites || [] });
  }

  onClick(location) {
    this.setState({ location, hidden: false });
  }

  // eslint-disable-next-line no-unused-vars
  onAddEditMap({ document, error }) {
    // TO DO - Splice into this.state.maps
    // TO DO - What if there are errors?
    // ({ data, errors }) => console.log([data, errors])
    this.setState({ selectedMap: document });
  }

  render() {
    const {
      accountId,
      // configId,
      data,
      location,
      addMapModal,
      editMapModal,
      addLocationModal,
      addMapLocationModal,
      selectedMap
    } = this.state;

    if (!data) {
      return (
        <div className="geoOpsContainer">
          <Spinner />
        </div>
      );
    }

    return (
      <>
        <Toolbar setParentState={this.callbacks.setParentState} />
        <Grid className="primary-grid">
          <GridItem columnSpan={3} className="gridItem">
            {/* <LocationTable
              configId={configId}
              callbacks={this.callbacks}
              data={data}
            /> */}
            <EmptyState />
          </GridItem>
          <GridItem
            columnSpan={9}
            collapseGapBefore
            collapseGapAfter
            className="gridItem"
          >
            {selectedMap && (
              <PoSMap
                accountId={accountId}
                map={selectedMap}
                callbacks={this.callbacks}
                data={data}
              />
            )}
            {!selectedMap && <EmptyState />}
          </GridItem>
        </Grid>

        {/* Modals */}

        {/* Location Detail */}
        {location && (
          <DetailModal
            {...this.state}
            callbacks={this.callbacks}
            launcherUrlState={this.props.launcherUrlState}
          />
        )}

        {/* Add/Edit Map */}
        {selectedMap && (
          <Modal
            hidden={!(addMapModal || editMapModal)}
            onClose={() =>
              this.setState({ addMapModal: false, editMapModal: false })
            }
          >
            <JsonSchemaForm
              accountId={accountId}
              guid={editMapModal ? selectedMap.guid : false}
              schema={MAP_JSON_SCHEMA}
              defaultValues={MAP_DEFAULTS}
              getDocument={getMap}
              writeDocument={writeMap}
              onWrite={this.callbacks.onAddEditMap}
            />
          </Modal>
        )}

        {/* Add Location */}
        <Modal
          hidden={!addLocationModal}
          onClose={() => this.setState({ addLocationModal: false })}
        >
          <JsonSchemaForm
            accountId={accountId}
            guid={false}
            schema={LOCATION_JSON_SCHEMA}
            defaultValues={false}
            getDocument={getMap}
            writeDocument={writeMap}
            onWrite={({ data, errors }) => console.log([data, errors])}
          />
        </Modal>

        {/* Add Location to a Map and define aggregate */}
        <Modal
          hidden={!addMapLocationModal}
          onClose={() => this.setState({ addMapLocationModal: false })}
        >
          <JsonSchemaForm
            accountId={accountId}
            guid={false}
            schema={MAP_LOCATION_JSON_SCHEMA}
            defaultValues={false}
            getDocument={getMap}
            writeDocument={writeMap}
            onWrite={({ data, errors }) => console.log([data, errors])}
          />
        </Modal>
      </>
    );
  } // render
}
