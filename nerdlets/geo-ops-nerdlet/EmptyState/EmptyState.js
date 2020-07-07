import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Stack, Button } from 'nr1';
import { Map, TileLayer } from 'react-leaflet';
import { EmptyState } from '@newrelic/nr1-community';
import { ToolbarWrapper } from '../../shared/components';

import {
  StyledToolbarItem,
  StyledGrid,
  LeftGridItem,
  RightGridItem,
  MapWrapper,
  GetStartedWrapper,
  GetStartedPopover
} from './styles';

const EmptyStateWrapper = ({ navigation }) => {
  const STARTING_CENTER = [39.5, -98.35];
  const STARTING_ZOOM = 5;

  return (
    <>
      <ToolbarWrapper
        left={<StyledToolbarItem>Create a map to begin</StyledToolbarItem>}
        right={null}
      />
      <StyledGrid
        spacingType={[Grid.SPACING_TYPE.NONE, Grid.SPACING_TYPE.NONE]}
      >
        <LeftGridItem columnSpan={3} fullHeight collapseGapAfter>
          <EmptyState
            heading="No Locations"
            description="To view the list of your locations and their status, create your first map and add locations to it!"
            buttonText="Get Started"
            buttonOnClick={() => navigation.router({ to: 'createMap' })}
          />
        </LeftGridItem>
        <RightGridItem columnSpan={9}>
          <MapWrapper>
            <GetStartedWrapper
              horizontalType={Stack.HORIZONTAL_TYPE.CENTER}
              verticalType={Stack.VERTICAL_TYPE.CENTER}
            >
              <GetStartedPopover>
                <h3>Get started by creating a map</h3>
                <p>
                  It looks like you haven’t yet set up your first map. Get
                  started below and we’ll walk you through how to get your first
                  map up and running!
                </p>
                <hr />
                <Button
                  type={Button.TYPE.PRIMARY}
                  sizeType={Button.SIZE_TYPE.LARGE}
                  onClick={() => navigation.router({ to: 'createMap' })}
                >
                  Get Started
                </Button>
              </GetStartedPopover>
            </GetStartedWrapper>
            <Map center={STARTING_CENTER} zoomControl zoom={STARTING_ZOOM}>
              <TileLayer
                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </Map>
          </MapWrapper>
        </RightGridItem>
      </StyledGrid>
    </>
  );
};

EmptyStateWrapper.propTypes = {
  navigation: PropTypes.object
};

export default EmptyStateWrapper;
