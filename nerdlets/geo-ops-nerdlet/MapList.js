import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button, Grid, GridItem, StackItem } from 'nr1';

import Toolbar from '../shared/components/Toolbar';
import MapItem from '../shared/components/MapItem';

import { deleteMap } from '../shared/services/map';

import { latLngToTile } from '../shared/utils';

const LeftToolbar = ({ navigation }) => {
  return (
    <>
      <StackItem className="toolbar-item has-separator">
        <Button
          type={Button.TYPE.PLAIN}
          iconType={Button.ICON_TYPE.INTERFACE__CHEVRON__CHEVRON_LEFT}
          onClick={() => navigation.router({ to: 'viewMap' })}
        >
          Back to main view
        </Button>
      </StackItem>
      <StackItem className="toolbar-item has-separator">
        <Button
          type={Button.TYPE.PLAIN}
          onClick={() =>
            navigation.router({
              to: 'createMap',
              state: { selectedMap: null, activeStep: 1 }
            })
          }
        >
          Guided Setup
        </Button>
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
        <Button
          type={Button.TYPE.PRIMARY}
          onClick={() =>
            navigation.router({
              to: 'createMap',
              state: { selectedMap: null, activeStep: 1 }
            })
          }
        >
          New Map
        </Button>
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

      if (!map.guid) {
        return null;
      }

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
            <Grid className="map-grid">
              {mapGridItems}
              <GridItem columnSpan={3}>
                <div
                  className="add-map-item-button"
                  onClick={() =>
                    navigation.router({
                      to: 'createMap',
                      state: { selectedMap: null, activeStep: 1 }
                    })
                  }
                >
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 48 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M47.75 22.375H26V0.625H22.375V22.375H0.625V26H22.375V47.75H26V26H47.75V22.375Z"
                      fill="#B9BDBD"
                    />
                  </svg>
                </div>
              </GridItem>
            </Grid>
          </GridItem>
        </Grid>
      </>
    );
  }
}
