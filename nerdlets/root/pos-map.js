/*
 * Copyright 2019 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { generateIcon } from './utils';

import { getMapLocations } from '../shared/services/map-location';
// import { NerdGraphError } from '@newrelic/nr1-community';

export default class PoSMap extends Component {
  static propTypes = {
    accountId: PropTypes.number.isRequired,
    map: PropTypes.object.isRequired,
    callbacks: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      errors: []
    };
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

  async loadMapLocations() {
    const { accountId, map } = this.props;
    console.log(accountId);
    const { data, errors } = await getMapLocations({
      accountId,
      mapGuid: map.guid
    });

    this.setState({ data, errors });
  }

  render() {
    const { map, callbacks } = this.props;
    const { data, errors } = this.state;

    // const config = geoopsConfig.find(c => c.id === configId);

    return (
      <div className="leaflet-wrapper">
        {errors && <pre>{JSON.stringify(errors, null, 2)}</pre>}
        {!errors && (
          <Map
            center={[map.centerLat, map.centerLng]}
            zoom={map.zoom}
            ref={ref => {
              this.mapRef = ref;
            }}
          >
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {data.map(row => {
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
    );
  }
}
