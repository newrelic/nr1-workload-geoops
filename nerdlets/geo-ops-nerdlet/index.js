import React, { PureComponent } from 'react';
import { Button, Grid, GridItem } from 'nr1';
import { Map, TileLayer } from 'react-leaflet';

import LocationsTable from '../shared/components/LocationsTable';
import GeoOpsNerdlet from './geo-ops-nerdlet';
import GettingStarted from './GettingStarted';

export default class index extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      gettingStarted: false,
      accountId: 630060,
      // TO DO - Does Map selection live this high in the tree so we can pass it into Getting Started?
      // eslint-disable-next-line react/no-unused-state
      selectedMap: null
    };
  }

  render() {
    const { accountId, gettingStarted } = this.state;

    const startingCenter = [39.5, -98.35];
    const startingZoom = 4;

    if (gettingStarted) {
      return (
        <Grid
          className="primary-grid"
          spacingType={[Grid.SPACING_TYPE.NONE, Grid.SPACING_TYPE.NONE]}
        >
          <GridItem
            columnSpan={6}
            fullHeight
            className="locations-table-grid-item"
          >
            <GettingStarted
              accountId={accountId}
              onMapChange={({ map }) => {
                // eslint-disable-next-line no-alert
                alert(
                  "You've created a new map and stored it in Account Storage!"
                );
                // eslint-disable-next-line no-console
                console.log('Map updated');
                // eslint-disable-next-line no-console
                console.log(JSON.stringify(map, null, 2));
              }}
            />
          </GridItem>
          <GridItem className="primary-content-container" columnSpan={6}>
            <div className="leaflet-wrapper">
              <Map center={startingCenter} zoomControl zoom={startingZoom}>
                <TileLayer
                  attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </Map>
            </div>
          </GridItem>
        </Grid>
      );
    }

    return (
      <Grid
        className="primary-grid"
        spacingType={[Grid.SPACING_TYPE.NONE, Grid.SPACING_TYPE.NONE]}
      >
        <GridItem
          columnSpan={3}
          fullHeight
          className="locations-table-grid-item"
        >
          <Button
            onClick={() => this.setState({ gettingStarted: true })}
            type={Button.TYPE.PRIMARY}
            iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__NOTES__A_ADD}
          >
            Get Started
          </Button>
          <LocationsTable />
        </GridItem>
        <GridItem className="primary-content-container" columnSpan={9}>
          <GeoOpsNerdlet />
        </GridItem>
      </Grid>
    );
  }
}
