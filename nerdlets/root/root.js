/*
 * Copyright 2019 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import geoopsConfig from '../../geoopsConfig';
import LocationTable from './location-table';
import { Grid, GridItem, Spinner, UserStorageMutation } from 'nr1';
import PoSMap from './pos-map';
import Data from './data';
import DetailModal from './detail-modal';

export default class GeoOpsNerdlet extends Component {
  static propTypes = {
    launcherUrlState: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      configId: geoopsConfig[0].id,
      data: null,
      hidden: true,
      location: null,
      favorites: null
    };
    this.callbacks = {
      onClick: this.onClick.bind(this),
      setData: this.setData.bind(this),
      setFavorite: this.setFavorite.bind(this),
      closeModal: this.closeModal.bind(this)
    };
    this.dataProcess = new Data({
      demoMode: true,
      configId: this.state.configId,
      refreshTimeout: 60000,
      callbacks: this.callbacks
    });
  }

  closeModal() {
    this.setState({ hidden: true, location: null });
  }

  setFavorite(id) {
    const { data } = this.state;
    let favorites = this.state.favorites ? this.state.favorites : [];
    const favorite = favorites.find(f => f === id);
    if (favorite) {
      favorites = favorites.filter(f => f != id);
    } else {
      favorites.push(id);
    }
    console.debug(`Writing ${favorites}`);
    UserStorageMutation.mutate({
      actionType: UserStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
      collection: 'v0-infra-geoops',
      documentId: 'favorites',
      document: { favorites }
    });
    const location = data.find(l => l.id == id);
    location.favorite = !location.favorite;
    // console.debug(`Setting location ${id} to a favorite status of ${location.favorite}`)
    this.setState({ data, favorites });
  }

  setData(data, favorites) {
    // console.debug("Setting data", data);
    this.setState({ data, favorites: favorites || [] });
  }

  onClick(location) {
    this.setState({ location, hidden: false });
  }

  componentWillUnmount() {
    if (this.dataProcess) {
      this.dataProcess.stop();
    }
  }

  render() {
    const { configId, data, location } = this.state;
    if (!data) {
      return (
        <div className="geoOpsContainer">
          <Spinner />
        </div>
      );
    }

    return (
      <Grid className="primary-grid">
        <GridItem columnSpan={3} className="gridItem">
          <LocationTable
            configId={configId}
            callbacks={this.callbacks}
            data={data}
          />
        </GridItem>
        <GridItem
          columnSpan={9}
          collapseGapBefore
          collapseGapAfter
          className="gridItem"
        >
          <PoSMap configId={configId} callbacks={this.callbacks} data={data} />
          {location && (
            <DetailModal
              {...this.state}
              callbacks={this.callbacks}
              launcherUrlState={this.props.launcherUrlState}
            />
          )}
        </GridItem>
      </Grid>
    );
  } // render
}
