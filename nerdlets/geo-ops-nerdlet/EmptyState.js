import React from 'react';
import PropTypes from 'prop-types';
import { Grid, GridItem, Stack, StackItem, Button } from 'nr1';
import { Map, TileLayer } from 'react-leaflet';
import { EmptyState } from '@newrelic/nr1-community';
import styled from 'styled-components';
import { ToolbarWrapper, ToolbarItem } from '../shared/components/Toolbar';

const StyledToolbarItem = styled(ToolbarItem)`
  font-size: 1.25em;
  color: #8e9494;
`;

const StyledGrid = styled(Grid)`
  height: calc(100% - 74px);
`;

const LeftGridItem = styled(GridItem)`
  overflow: scroll;
  overflow-x: hidden;
  background-color: #fff;
  box-shadow: 0px 1px 0px rgba(0, 75, 82, 0.17),
    0px 3px 2px rgba(0, 49, 54, 0.05), 0px 1px 3px rgba(0, 134, 148, 0.08),
    0px 8px 17px rgba(88, 114, 117, 0.25);
`;

const RightGridItem = styled(GridItem)`
  position: relative;
`;

const MapWrapper = styled.div`
  width: 100%;
  height: 100%;
`;

const GetStartedWrapper = styled(Stack)`
  display: flex;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
`;

const GetStartedPopover = styled(StackItem)`
  max-width: 440px;
  text-align: center;
  padding: 24px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0px 1px 0px rgba(0, 75, 82, 0.11),
    0px 3px 0px rgba(0, 49, 54, 0.04), 0px 1px 3px rgba(0, 134, 148, 0.03),
    0px 8px 7px rgba(70, 107, 111, 0.05);

  p {
    color: #8e9494;
  }

  hr {
    margin: 20px 0;
    border: none;
    border-top: 1px dotted #e3e4e4;
  }
`;

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
