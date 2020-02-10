import React, { PureComponent } from 'react';
import { Grid, GridItem } from 'nr1';
import LocationsTable from '../components/LocationsTable';
import GeoOpsNerdlet from './geo-ops-nerdlet';

export default class index extends PureComponent {
  render() {
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
          <LocationsTable />
        </GridItem>
        <GridItem className="primary-content-container" columnSpan={9}>
          <GeoOpsNerdlet />
        </GridItem>
      </Grid>
    );
  }
}
