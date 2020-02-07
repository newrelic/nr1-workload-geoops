import React, { Component } from 'react';
import { Grid, GridItem } from 'nr1';
import LocationsTable from '../components/LocationsTable';

export default class index extends Component {
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
          hi
        </GridItem>
      </Grid>
    );
  }
}
