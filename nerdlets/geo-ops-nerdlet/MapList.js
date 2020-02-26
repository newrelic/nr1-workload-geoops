import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button, Grid, GridItem, Stack, StackItem, Icon } from 'nr1';

import { EmptyState, NerdGraphError } from '@newrelic/nr1-community';
import Toolbar from '../shared/components/Toolbar';
import GeoMap from './geo-map';

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
      maps: props.maps || [],
      settingsPopoverActive: false
    };

    this.handleSettingsPopover = this.handleSettingsPopover.bind(this);
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

  handleSettingsPopover(e) {
    this.setState(prevState => ({
      settingsPopoverActive: !prevState.settingsPopoverActive
    }));
    e.stopPropagation();
  }

  renderSettingsButton(map, navigation) {
    return (
      <div
        className={`service-settings-button-container ${
          this.state.settingsPopoverActive
            ? 'settings-popover-active'
            : 'settings-popover-inactive'
        }`}
      >
        <Button
          sizeType={Button.SIZE_TYPE.MEDIUM}
          className="service-settings-button"
          type={Button.TYPE.NORMAL}
          iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__CONFIGURE}
          onClick={this.handleSettingsPopover}
        />
        <ul className="service-settings-dropdown">
          <li
            className="service-settings-dropdown-item"
            onClick={() => navigation.editWizard({ map, activeStep: 2 })}
          >
            <Icon type={Icon.TYPE.INTERFACE__INFO__INFO} />
            Guided Configuration
          </li>
          <li
            className="service-settings-dropdown-item"
            onClick={() => navigation.edit({ guid: map.guid })}
          >
            <Icon type={Icon.TYPE.INTERFACE__OPERATIONS__EDIT} />
            Edit Map
          </li>
          <li
            className="service-settings-dropdown-item destructive"
            onClick={() => this.deleteMap({ map })}
          >
            <Icon
              type={Icon.TYPE.INTERFACE__OPERATIONS__TRASH}
              color="#BF0016"
            />
            Delete Map
          </li>
          <li
            className="service-settings-dropdown-item destructive"
            onClick={async () =>
              deleteMapLocationCollection({
                accountId: map.accountId,
                mapGuid: map.guid
              })
            }
          >
            <Icon
              type={Icon.TYPE.INTERFACE__OPERATIONS__TRASH}
              color="#BF0016"
            />
            Delete Markers
          </li>
        </ul>
      </div>
    );
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
        <GridItem columnSpan={3} key={map.guid}>
          <div className="map-grid-item">
            <section className="map-grid-item-preview">
              <GeoMap
                accountId={map.accountId}
                map={map}
                center={[map.lat, map.lng]}
                zoom={map.zoom}
              />
              <div className="map-grid-item-preview-hover-contents">
                <Button
                  onClick={() => this.props.navigation.edit({ guid: map.guid })}
                  className="map-grid-item-preview-hover-contents-button"
                >
                  View map
                </Button>
              </div>
            </section>
            <Stack
              fullWidth
              verticalType={Stack.VERTICAL_TYPE.CENTER}
              className="map-grid-item-bottom"
            >
              <StackItem className="map-grid-item-meta">
                <h4 className="map-grid-item-name">{map.title || map.guid}</h4>
                <h6 className="map-grid-item-subtitle">24 locations</h6>
              </StackItem>
              <StackItem className="map-grid-item-settings-button">
                {this.renderSettingsButton(map, navigation)}
              </StackItem>
            </Stack>
          </div>
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
