import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import uniq from 'lodash.uniq';

import {
  Button,
  Dropdown,
  DropdownItem,
  EntitiesByGuidsQuery,
  Grid,
  GridItem,
  Spinner,
  StackItem
} from 'nr1';

import { EmptyState } from '@newrelic/nr1-community';

import MapLocationQuery from '../shared/components/MapLocationQuery';
// import EntityFetcher from '../shared/components/EntityFetcher';

import GeoMap from './geo-map';
import Toolbar from '../shared/components/Toolbar';
import MapLocationTable from '../shared/components/MapLocationTable';

const LeftToolbar = ({ navigation }) => {
  return (
    <>
      <StackItem className="toolbar-item has-separator">
        <Button onClick={navigation.back}>Back to main view</Button>
      </StackItem>
      <StackItem className="toolbar-item has-separator">
        <Dropdown title="Choose an Account">
          <DropdownItem>Account 1</DropdownItem>
          <DropdownItem>Account 2</DropdownItem>
          <DropdownItem>Account 3</DropdownItem>
        </Dropdown>
      </StackItem>
      <StackItem className="toolbar-item has-separator">
        <Dropdown label="Map" title="Choose a map">
          <DropdownItem>Map 1</DropdownItem>
          <DropdownItem>Map 2</DropdownItem>
          <DropdownItem>Map 3</DropdownItem>
        </Dropdown>
      </StackItem>
    </>
  );
};
LeftToolbar.propTypes = {
  navigation: PropTypes.object
};

const RightToolbar = ({ navigation }) => {
  return (
    <>
      <StackItem className="">
        <Button onClick={navigation.createMap}>New Map</Button>
      </StackItem>
      <StackItem className="">
        <Button>Settings</Button>
      </StackItem>
    </>
  );
};
RightToolbar.propTypes = {
  navigation: PropTypes.object
};

export default class ViewMap extends Component {
  static propTypes = {
    map: PropTypes.object,
    navigation: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      //
    };
  }

  render() {
    const { map, navigation } = this.props;

    return (
      <>
        <Toolbar
          left={<LeftToolbar navigation={navigation} />}
          right={<RightToolbar navigation={navigation} />}
        />
        <Grid
          className="primary-grid"
          spacingType={[Grid.SPACING_TYPE.NONE, Grid.SPACING_TYPE.NONE]}
        >
          <MapLocationQuery map={map}>
            {({ loading, errors, data: mapLocations }) => {
              if (errors) {
                //
              }

              if (loading) {
                return (
                  <div className="geoOpsContainer">
                    <Spinner />
                  </div>
                );
              }

              const entities = mapLocations.reduce(
                (previousValue, currentValue) => {
                  previousValue.push(...currentValue.document.entities);
                  return previousValue;
                },
                []
              );
              const entityGuids = uniq(entities.map(e => e.guid));

              const entityFragmentExtension = gql`
                fragment EntityFragmentExtension on EntityOutline {
                  indexedAt
                  guid
                  ... on AlertableEntityOutline {
                    alertSeverity
                  }
                }
              `;

              return (
                <>
                  <GridItem
                    columnSpan={3}
                    fullHeight
                    className="locations-table-grid-item"
                  >
                    <MapLocationTable />
                  </GridItem>
                  <GridItem
                    className="primary-content-container"
                    columnSpan={9}
                  >
                    <Grid className="primary-grid">
                      <GridItem
                        columnSpan={12}
                        collapseGapBefore
                        collapseGapAfter
                        className="gridItem"
                      >
                        {map && (
                          <>
                            <EntitiesByGuidsQuery
                              entityGuids={entityGuids}
                              entityFragmentExtension={entityFragmentExtension}
                            >
                              {({ loading, errors, data }) => {
                                if (loading) {
                                  //
                                }

                                if (errors) {
                                  //
                                }
                                return (
                                  <GeoMap
                                    map={map}
                                    mapLocations={mapLocations}
                                    entities={data}
                                    // onMarkerClick={marker => console.log(marker)}
                                    // onMapClick={this.onMapClick}
                                  />
                                );
                              }}
                            </EntitiesByGuidsQuery>
                          </>
                        )}

                        {!map && <EmptyState />}
                      </GridItem>
                    </Grid>
                  </GridItem>
                </>
              );
            }}
          </MapLocationQuery>
        </Grid>
      </>
    );
  }
}
