import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button, Grid, GridItem, StackItem } from 'nr1';

import Toolbar from '../shared/components/Toolbar';
import MapItem from '../shared/components/MapItem';

import { deleteMap } from '../shared/services/map';

import { latLngToTile } from '../shared/utils';

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
          iconType={Button.ICON_TYPE.INTERFACE__SIGN__PLUS}
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
        <Toolbar right={<RightToolbar navigation={navigation} />} />

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
