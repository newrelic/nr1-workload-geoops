import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Grid, GridItem, Stack, StackItem, Button } from 'nr1';
import { Map, TileLayer } from 'react-leaflet';
import { EmptyState } from '@newrelic/nr1-community';
import Toolbar from '../shared/components/Toolbar';

const LeftToolbar = () => {
  return (
    <>
      <StackItem className="toolbar-item">
        <span className="welcome-message">Create a map to begin</span>
      </StackItem>
    </>
  );
};

export default class index extends PureComponent {
  static propTypes = {
    navigation: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      startingCenter: [39.5, -98.35],
      startingZoom: 5
    };
  }

  render() {
    const { startingCenter, startingZoom } = this.state;

    return (
      <>
        <Toolbar left={<LeftToolbar />} right={null} />
        <Grid
          className="primary-grid welcome-page-primary-grid"
          spacingType={[Grid.SPACING_TYPE.NONE, Grid.SPACING_TYPE.NONE]}
        >
          <GridItem
            columnSpan={3}
            fullHeight
            className="locations-table-grid-item"
            collapseGapAfter
          >
            <EmptyState
              heading="No Locations"
              description="To view the list of your locations and their status, create your first map and add locations to it!"
              buttonText="Get Started"
              buttonOnClick={() =>
                this.props.navigation.router({ to: 'createMap' })
              }
            />
          </GridItem>
          <GridItem
            className="primary-content-container welcome-page-map"
            columnSpan={9}
          >
            <div className="leaflet-wrapper">
              <Stack
                className="get-started-popover-container"
                horizontalType={Stack.HORIZONTAL_TYPE.CENTER}
                verticalType={Stack.VERTICAL_TYPE.CENTER}
              >
                <StackItem className="get-started-popover">
                  <h3>Get started by creating a map</h3>
                  <p>
                    It looks like you haven’t yet set up your first map. Get
                    started below and we’ll walk you through how to get your
                    first map up and running!
                  </p>
                  <hr />
                  <Button
                    type={Button.TYPE.PRIMARY}
                    sizeType={Button.SIZE_TYPE.LARGE}
                    onClick={() =>
                      this.props.navigation.router({ to: 'createMap' })
                    }
                  >
                    Get Started
                  </Button>
                </StackItem>
              </Stack>
              <Map center={startingCenter} zoomControl zoom={startingZoom}>
                {/*
                  For funsies, try swapping out the TileLayer url to:
                  https://{s}.tile.thunderforest.com/spinal-map/{z}/{x}/{y}.png
                */}
                <TileLayer
                  attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </Map>
            </div>
          </GridItem>
        </Grid>
      </>
    );
  }
}
