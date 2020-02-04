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
        <GridItem columnSpan={2}>
          <LocationsTable />
        </GridItem>
        <GridItem className="primary-content-container" columnSpan={10}>
          hi
        </GridItem>
      </Grid>
    );
  }
}
