import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button, Stack, StackItem, Icon, Modal, HeadingText, Toast } from 'nr1';
import { startCase } from 'lodash';

import GeoMap from '../../../geo-ops-nerdlet/GeoMap';
import { deleteMap } from '../../services/map';
import { deleteMapLocationCollection } from '../../services/map-location';

import {
  DropdownContainer,
  Dropdown,
  DropdownOption,
  StyledIcon,
  MapItemContainer,
  MapPreviewContainer,
  MapItemBottom,
  MapMetaContainer,
  MapPreview,
  ViewMapButton
} from './styles';

export default class MapItem extends PureComponent {
  static propTypes = {
    map: PropTypes.object,
    navigation: PropTypes.object,
    onMapDelete: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      settingsPopoverActive: false,
      deleteModalActive: false,
      deleteModalType: 'map'
    };
  }

  async deleteMap({ map }) {
    try {
      const result = await deleteMap({ map });
      if (result) {
        if (result[1].data.nerdStorageDeleteDocument.deleted) {
          this.props.onMapDelete({ map });
          Toast.showToast({
            title: `${startCase(this.state.deleteModalType)} deleted`,
            description: `The map "${map.title}" has been permantely deleted`,
            type: Toast.TYPE.NORMAL
          });
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
    this.props.onMapDelete({ map });
  }

  handleSettingsPopover = e => {
    this.setState(prevState => ({
      settingsPopoverActive: !prevState.settingsPopoverActive
    }));

    e.stopPropagation();
  };

  handleDeleteMapConfirmationButton(e, map) {
    e.stopPropagation();

    this.setState({ deleteModalActive: false });
    this.deleteMap({ map });
  }

  handleDeleteLocationsConfirmationButton(e, map) {
    e.stopPropagation();

    this.setState({ deleteModalActive: false });

    deleteMapLocationCollection({
      accountId: map.accountId,
      mapGuid: map.guid
    });

    Toast.showToast({
      title: `${startCase(this.state.deleteModalType)} deleted`,
      description: `All locations from the map "${map.title}" have been deleted.`,
      type: Toast.TYPE.NORMAL
    });
  }

  renderSettingsButton() {
    const { map, navigation } = this.props;

    return (
      <DropdownContainer>
        <Button
          sizeType={Button.SIZE_TYPE.MEDIUM}
          className="service-settings-button"
          type={Button.TYPE.NORMAL}
          iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__CONFIGURE}
          onClick={this.handleSettingsPopover}
        />
        <Dropdown isVisible={this.state.settingsPopoverActive}>
          <DropdownOption
            onClick={e => {
              e.stopPropagation();
              navigation.router({
                to: 'createMap',
                state: { selectedMap: map, activeStep: 1 }
              });
            }}
          >
            <StyledIcon type={Icon.TYPE.INTERFACE__OPERATIONS__EDIT} />
            Edit Map
          </DropdownOption>
          <DropdownOption
            isDestructive
            onClick={e => {
              e.stopPropagation();
              this.setState({
                deleteModalActive: true,
                deleteModalType: 'map'
              });
            }}
          >
            <StyledIcon
              type={Icon.TYPE.LOCATION__LOCATION__MAP}
              color="#BF0016"
            />
            Delete Map
          </DropdownOption>
          <DropdownOption
            isDestructive
            onClick={e => {
              e.stopPropagation();
              this.setState({
                deleteModalActive: true,
                deleteModalType: 'locations'
              });
            }}
          >
            <StyledIcon
              type={Icon.TYPE.LOCATION__LOCATION__PIN}
              color="#BF0016"
            />
            Delete Markers
          </DropdownOption>
        </Dropdown>
      </DropdownContainer>
    );
  }

  render() {
    const { map, navigation } = this.props;
    const { deleteModalActive, deleteModalType } = this.state;
    const center = [parseFloat(map.lat), parseFloat(map.lng)];
    const zoom = parseInt(map.zoom, 10);

    return (
      <MapItemContainer
        key={map.guid}
        onClick={() =>
          navigation.router({ to: 'viewMap', state: { selectedMap: map } })
        }
      >
        <MapPreviewContainer>
          <GeoMap map={map} center={center} zoom={zoom} />
          <MapPreview>
            <ViewMapButton
              onClick={() =>
                navigation.router({
                  to: 'viewMap',
                  state: { selectedMap: map }
                })
              }
            >
              View map
            </ViewMapButton>
          </MapPreview>
        </MapPreviewContainer>
        <MapItemBottom fullWidth verticalType={Stack.VERTICAL_TYPE.CENTER}>
          <MapMetaContainer>
            <h4>{map.title || map.guid}</h4>
            <h6>{map.description || 'No description'}</h6>
          </MapMetaContainer>
          <StackItem>{this.renderSettingsButton(map, navigation)}</StackItem>
        </MapItemBottom>
        <Modal
          hidden={!deleteModalActive}
          onClose={() => this.setState({ deleteModalActive: false })}
        >
          <HeadingText type={HeadingText.TYPE.HEADING_2}>
            Are you sure you want to delete{' '}
            {deleteModalType === 'map' ? 'this map' : 'all locations'}?
          </HeadingText>
          <p>
            This action cannot be undone. Please confirm whether or not you want
            to delete{' '}
            {deleteModalType === map
              ? 'this map'
              : 'all locations from this map'}
            .
          </p>

          <Button
            type={Button.TYPE.PRIMARY}
            onClick={e => {
              e.stopPropagation();
              this.setState({ deleteModalActive: false });
            }}
          >
            Cancel
          </Button>
          {deleteModalType === 'map' ? (
            <Button
              type={Button.TYPE.DESTRUCTIVE}
              onClick={e => this.handleDeleteMapConfirmationButton(e, map)}
              iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__TRASH}
            >
              Delete {deleteModalType}
            </Button>
          ) : (
            <Button
              type={Button.TYPE.DESTRUCTIVE}
              onClick={e =>
                this.handleDeleteLocationsConfirmationButton(e, map)
              }
              iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__TRASH}
            >
              Delete {deleteModalType}
            </Button>
          )}
        </Modal>
      </MapItemContainer>
    );
  }
}
