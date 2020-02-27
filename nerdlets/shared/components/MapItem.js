import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button, Stack, StackItem, Icon } from 'nr1';

import GeoMap from '../../geo-ops-nerdlet/geo-map';

import { deleteMap } from '../services/map';
import { deleteMapLocationCollection } from '../services/map-location';

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

export default class MapItem extends PureComponent {
  static propTypes = {
    map: PropTypes.object,
    navigation: PropTypes.object,
    onMapDelete: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      settingsPopoverActive: false
    };

    this.handleSettingsPopover = this.handleSettingsPopover.bind(this);
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

  renderSettingsButton() {
    const { map, navigation } = this.props;

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
    const { map, navigation } = this.props;
    return (
      <div
        className="map-grid-item"
        key={map.guid}
        onClick={() => this.props.navigation.edit({ guid: map.guid })}
      >
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
    );
  }
}
