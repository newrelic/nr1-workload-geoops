import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button, Stack, StackItem, Icon, Modal, HeadingText, Toast } from 'nr1';
import { startCase } from 'lodash';
import styled from 'styled-components';

import GeoMap from '../../geo-ops-nerdlet/GeoMap';

import { deleteMap } from '../services/map';
import { deleteMapLocationCollection } from '../services/map-location';

const MapItemContainer = styled.div`
  background: #ffffff;
  box-shadow: 0px 1px 0px rgba(0, 75, 82, 0.11),
    0px 3px 0px rgba(0, 49, 54, 0.04), 0px 1px 3px rgba(0, 134, 148, 0.03),
    0px 4px 4px rgba(70, 107, 111, 0.05);
  border-radius: 3px;
  transition: all 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  :hover {
    cursor: pointer;
    transform: translateY(-3px);
    box-shadow: 0 8px 15px 5px rgba(31, 75, 116, 0.075),
      0 1px 3px 1px rgba(0, 134, 148, 0.05), 0 3px 0 0 rgba(0, 49, 54, 0.05),
      0 1px 0 0 rgba(0, 75, 82, 0.15);
  }
`;

const MapPreviewContainer = styled.section`
  width: 100%;
  height: 9vw;
  position: relative;
  border-radius: 3px 3px 0 0;
  overflow: hidden;

  .leaflet-wrapper {
    pointer-events: none;
  }

  .leaflet-control-zoom,
  .leaflet-control-attribution {
    display: none;
  }

  & > h1 {
    display: none;
  }
`;

const MapPreview = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.65);
  opacity: 0;
  transition: opacity 0.1s cubic-bezier(0.075, 0.82, 0.165, 1);

  ${MapItemContainer}:hover & {
    opacity: 1;
  }
`;

const MapMetaContainer = styled(StackItem)`
  margin-right: auto;

  h4 {
    margin-bottom: 2px;
    margin-top: 0;
  }

  h6 {
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 12px;
    line-height: 16px;
    color: #8e9494;
    font-weight: 400;
  }
`;

const DropdownContainer = styled.div`
  position: relative;
`;

const Dropdown = styled.ul`
  display: ${({ isVisible }) => (isVisible ? 'block' : 'none')};
  width: 150px;
  position: absolute;
  top: -67px;
  right: 34px;
  background: #ffffff;
  border: 1px solid #e3e4e4;
  box-sizing: border-box;
  box-shadow: 0px 16px 32px rgba(0, 13, 13, 0.2),
    0px 16px 32px rgba(0, 0, 0, 0.04);
  border-radius: 4px;
  list-style-type: none;
  text-align: left;
  z-index: 10000;
`;

const DropdownOption = styled.li`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  color: ${({ isDestructive }) => (isDestructive ? '#bf0016' : '#000d0d')};
  padding: 8px 8px;
  line-height: 16px;
  border-bottom: 1px solid #e3e4e4;

  :last-child {
    border: none;
  }

  :hover {
    cursor: pointer;
  }
`;

const StyledIcon = styled(Icon)`
  margin-right: 8px;
  position: relative;
  bottom: 1px;
`;

const MapItemBottom = styled(StackItem)`
  display: flex;
  align-items: center;
  height: 70px;
  padding: 0 16px;
`;

const ViewMapButton = styled(Button)`
  transition: all 0.5s cubic-bezier(0.075, 0.82, 0.165, 1);
  transform: translateY(-5px);
  opacity: 0;

  ${MapItemContainer}:hover & {
    transform: translateY(0);
    opacity: 1;
  }
`;

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
