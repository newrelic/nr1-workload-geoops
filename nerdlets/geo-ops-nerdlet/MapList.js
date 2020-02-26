import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button, Grid, GridItem, StackItem } from 'nr1';

import { EmptyState } from '@newrelic/nr1-community';
import Toolbar from '../shared/components/Toolbar';
import MapItem from './MapItem';

import { deleteMap } from '../shared/services/map';

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
    const { navigation, onMapDelete } = this.props;
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
        <GridItem columnSpan={3} key={map.guid}>
          <MapItem
            map={map}
            navigation={navigation}
            onMapDelete={onMapDelete}
          />
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
          className="primary-grid map-list-primary-grid"
          spacingType={[Grid.SPACING_TYPE.NONE, Grid.SPACING_TYPE.NONE]}
        >
          <GridItem columnSpan={12} fullHeight>
            <Grid>
              {mapGridItems}
              <GridItem columnSpan={3}>
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
