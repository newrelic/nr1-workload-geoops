import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button, Grid, GridItem, Stack, StackItem } from 'nr1';

import { EmptyState, NerdGraphError } from '@newrelic/nr1-community';
import Toolbar from '../shared/components/Toolbar';

import { deleteMap } from '../shared/services/map';
import { deleteMapLocationCollection } from '../shared/services/map-location';

import { latLngToTile } from '../shared/utils';

const LeftToolbar = ({ navigation }) => {
  return (
    <>
      <StackItem className="toolbar-item has-separator">
        <Button onClick={navigation.onBack}>Back to main view</Button>
      </StackItem>
      <StackItem className="toolbar-item has-separator">
        <Button onClick={navigation.onGettingStarted}>Guided Setup</Button>
      </StackItem>
      {/* TO DO - Filtering maps by Account/Region/etc. */}
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
    </>
  );
};
RightToolbar.propTypes = {
  navigation: PropTypes.object
};

export default class MapList extends PureComponent {
  static propTypes = {
    maps: PropTypes.array,
    navigation: PropTypes.object,
    onMapDelete: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      maps: props.maps || []
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.maps !== this.props.maps) {
      this.setState({ maps: this.props.maps });
    }
  }

  async deleteMap({ map }) {
    try {
      await deleteMap({ map });
    } catch (e) {
      console.log(e);
    }

    this.props.onMapDelete({ map });
  }

  render() {
    const { navigation } = this.props;
    const { maps } = this.state;

    const mapGridItems = maps.map(m => {
      const { document: map } = m;

      const { s, x, y, z } = latLngToTile({
        latLng: [map.lat, map.lng],
        zoom: 10 // TO DO - update to the default zoom the user sets?
      });

      const url = `https://${s}.tile.openstreetmap.org/${z}/${x}/${y}.png`;
      console.log(url);

      return (
        <GridItem columnSpan={4} key={map.guid}>
          <EmptyState
            heading={map.title || map.guid}
            buttonText="Edit Map"
            buttonOnClick={() => navigation.edit({ guid: map.guid })}
          />
          <Stack horizontalType={Stack.HORIZONTAL_TYPE.FILL_EVENLY}>
            <StackItem>
              <Button onClick={() => this.deleteMap({ map })}>
                Delete Map
              </Button>
            </StackItem>
            <StackItem>
              <Button
                onClick={() => navigation.editWizard({ map, activeStep: 2 })}
              >
                Guided Configuration
              </Button>
            </StackItem>
            <StackItem>
              <Button onClick={() => navigation.viewMap({ map })}>
                View Map
              </Button>
            </StackItem>
            <StackItem>
              <Button
                onClick={async () =>
                  deleteMapLocationCollection({
                    accountId: map.accountId,
                    mapGuid: map.guid
                  })
                }
              >
                Delete Markers
              </Button>
            </StackItem>
          </Stack>
        </GridItem>
      );
    });

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
          <GridItem
            columnSpan={12}
            fullHeight
            className="locations-table-grid-item"
          >
            <Grid>
              {mapGridItems}
              <GridItem columnSpan={4}>
                <EmptyState
                  heading="+"
                  buttonText="Create New Map"
                  buttonOnClick={navigation.createMap}
                />
              </GridItem>
            </Grid>
          </GridItem>
        </Grid>
      </>
    );
  }
}
