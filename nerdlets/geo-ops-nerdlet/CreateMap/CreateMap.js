import React from 'react';
import PropTypes from 'prop-types';

import { Button, Grid, Stack, StackItem } from 'nr1';
import {
  GettingStarted,
  JsonSchemaForm,
  AccountDropdown
} from '../../shared/components';
import DefineLocations from '../DefineLocations/DefineLocations';
import MapLocationData from '../MapLocationData/MapLocationData';
import GeoMap from '../GeoMap/GeoMap';

import { nerdStorageRequest } from '../../shared/utils';

import {
  MAP_UI_SCHEMA,
  MAP_JSON_SCHEMA,
  MAP_DEFAULTS
} from '../../shared/constants';

import { getMap, writeMap } from '../../shared/services/map';
import { getMapLocations } from '../../shared/services/map-location';

import {
  StyledGrid,
  AllMapsButton,
  LocationsTable,
  MapContainer,
  StepContainer,
  FormContainer,
  FooterContainer,
  FooterButtonsContainer,
  StyledButton
} from './styles';

const STEPS = [
  { order: 1, title: '1. Create a map' },
  { order: 2, title: '2. Define Locations' },
  { order: 3, title: '3. Map Entities to Locations' }
];

/*
 * Usage:
 * <CreateMap map={map} onMapChange={this.onMapChange} />
 *
 * TODO: A prop for where to pick-up at, i.e. - "startingStep={'create-map'}"
 */
export default class CreateMap extends React.PureComponent {
  static propTypes = {
    onMapChange: PropTypes.func,

    // Optional - pick up where they left off with a specific map
    // We "map" this onto local state
    maps: PropTypes.array,
    map: PropTypes.object,
    navigation: PropTypes.object,
    activeStep: PropTypes.number,
    hasNewLocations: PropTypes.bool
  };

  constructor(props) {
    super(props);

    const defaultFirstStep = STEPS.find(s => s.order === 1);
    const activeStep = STEPS.find(s => s.order === props.activeStep);

    this.state = {
      activeStep: activeStep || defaultFirstStep,
      map: props.map,
      mapLocations: [],
      mapLocationsLoading: false,
      mapLocationsLoadingErrors: [],
      selectedLatLng: false,
      mapZoomLevel: props.map && props.map.zoom ? props.map.zoom : 4,
      mapCenter: [39.5, -98.35],
      mapFormData: {}
    };

    this.createMapForm = React.createRef();

    MAP_UI_SCHEMA.accountId['ui:field'] = AccountDropdown;
  }

  componentDidMount = async () => {
    const { map } = this.state;

    if (map) {
      await this.loadMapLocations();
    }
  };

  componentDidUpdate = async prevProps => {
    if (
      prevProps.hasNewLocations !== this.props.hasNewLocations &&
      this.props.hasNewLocations
    ) {
      await this.loadMapLocations();
    }

    if (
      this.props.map &&
      this.props.map.zoom &&
      prevProps.map &&
      prevProps.map.zoom !== this.props.map.zoom
    ) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ mapZoomLevel: this.props.map.zoom });
    }

    if (prevProps.map !== this.props.map) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ map: this.props.map });
    }
  };

  loadMapLocations = async () => {
    const { map } = this.state;
    const { accountId } = map;

    if (!accountId) {
      throw new Error('Error: map is missing accountId');
    }

    this.setState({ mapLocationsLoading: true });

    const {
      data: mapLocations,
      errors: mapLocationsLoadingErrors
    } = await nerdStorageRequest({
      service: getMapLocations,
      params: { accountId, document: map }
    });

    this.setState({
      mapLocations,
      mapLocationsLoading: false,
      mapLocationsLoadingErrors
    });
  };

  fetchMap = async () => {
    const { map } = this.state;
    return getMap({ accountId: map.accountId, documentId: map.guid });
  };

  onAddEditMap = ({ data }) => {
    const { document } = data;

    // TODO: Expose error about adding/editing

    this.setState({ map: document }, () => {
      this.props.onMapChange({ map: document });
      this.nextStep();
    });
  };

  onMapLocationWrite = ({ mapLocation }) => {
    // TODO: Handle errors from updating each
    this.addOrUpdate({
      collectionName: 'mapLocations',
      item: mapLocation.data
    });
  };

  onMapClick = event => {
    const { activeStep } = this.state;
    const { lat, lng } = event.latlng;

    // Specific to map click on step 1
    if (activeStep.order === 1) {
      this.setState({
        mapCenter: [lat, lng]
      });
    }

    this.setState(prevState => ({
      selectedLatLng: [lat, lng],
      mapFormData: {
        ...prevState.mapFormData,
        lat,
        lng
      }
    }));
  };

  onZoomEnd = event => {
    const zoom = event.target._animateToZoom;
    this.setState(prevState => ({
      mapFormData: {
        ...prevState,
        zoom
      }
    }));
  };

  /*
   * collectionName is a local state array that needs updated in an immutable way
   * item is an un-nested nerdstore document that needs wrapped in { id: foo, document: item }
   */
  addOrUpdate = ({ collectionName, item }) => {
    const { [collectionName]: collection } = this.state;

    const itemIndex = collection.findIndex(i => i.document.guid === item.guid);
    const newDocument = { id: item.guid, document: item };

    // Update in place
    if (itemIndex > 0) {
      const updatedCollection = [...collection];
      updatedCollection.splice(itemIndex, 1, newDocument);

      const newState = {
        [collectionName]: updatedCollection
      };

      this.setState(newState);

      return;
    }

    // Append
    if (itemIndex === -1) {
      this.setState(prevState => {
        const newCollection = [
          ...prevState[collectionName],
          { id: item.guid, document: item }
        ];

        return {
          [collectionName]: newCollection
        };
      });
    }
  };

  // Given a step, determine the "next" one
  nextStep = () => {
    const { activeStep } = this.state;

    const nextStep = STEPS.find(step => step.order === activeStep.order + 1);

    if (nextStep) {
      this.setState({ activeStep: nextStep });
    } else {
      // TODO: Final? Change/bump state to viewing the map?
    }
  };

  previousStep = () => {
    const { activeStep } = this.state;

    const previousStep = STEPS.find(
      step => step.order === activeStep.order - 1
    );

    if (previousStep) {
      this.setState({ activeStep: previousStep });
    }
  };

  changeActiveStep = destinationStep => {
    this.setState({ activeStep: STEPS.find(s => s.order === destinationStep) });
  };

  render() {
    const { navigation, maps } = this.props;
    const {
      accountId,
      activeStep,
      map,
      mapLocations,
      mapLocationsLoading,
      mapLocationsLoadingErrors,
      selectedLatLng,
      mapZoomLevel,
      mapCenter,
      mapFormData
    } = this.state;

    return (
      <>
        {maps.length > 0 && (
          <AllMapsButton
            className="u-unstyledButton"
            onClick={() => navigation.router({ to: 'mapList' })}
            type={Button.TYPE.PRIMARY}
            iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__GROUP}
          >
            View all maps
          </AllMapsButton>
        )}
        <StyledGrid
          spacingType={[Grid.SPACING_TYPE.NONE, Grid.SPACING_TYPE.NONE]}
        >
          <LocationsTable columnSpan={6} fullHeight collapseGapAfter>
            <GettingStarted
              steps={STEPS}
              activeStep={activeStep}
              tempNavigation={step => this.changeActiveStep(step)}
            />

            {activeStep.order === 1 && (
              <StepContainer
                verticalType={Stack.HORIZONTAL_TYPE.CENTER}
                className="create-map"
              >
                <StackItem>
                  <h1>Create a map</h1>
                </StackItem>
                <FormContainer verticalType={Stack.HORIZONTAL_TYPE.CENTER}>
                  <JsonSchemaForm
                    ref={this.createMapForm}
                    schema={MAP_JSON_SCHEMA}
                    uiSchema={MAP_UI_SCHEMA}
                    defaultValues={MAP_DEFAULTS}
                    formData={mapFormData}
                    fetchDocument={map ? this.fetchMap : null}
                    writeDocument={({ formData }) =>
                      writeMap({
                        accountId,
                        documentId: map ? map.guid : formData.guid,
                        document: formData
                      })
                    }
                    onWrite={this.onAddEditMap}
                    onChange={({ formData }) => {
                      if (formData.zoom) {
                        this.setState({ mapZoomLevel: formData.zoom });
                      }

                      if (formData.accountId) {
                        this.setState({ accountId: formData.accountId });
                      }
                    }}
                  />
                </FormContainer>
                <FooterContainer>
                  <FooterButtonsContainer
                    verticalType={Stack.VERTICAL_TYPE.CENTER}
                  >
                    <StackItem>
                      <Button
                        sizeType={Button.SIZE_TYPE.LARGE}
                        type={Button.TYPE.SECONDARY}
                        onClick={() => navigation.router({ to: 'mapList' })}
                      >
                        Cancel
                      </Button>
                    </StackItem>
                    <StackItem>
                      <StyledButton
                        sizeType={Button.SIZE_TYPE.LARGE}
                        type={Button.TYPE.PRIMARY}
                        onClick={() => this.createMapForm.current.submit()}
                        iconType={
                          Button.ICON_TYPE.INTERFACE__CHEVRON__CHEVRON_RIGHT
                        }
                      >
                        Continue
                      </StyledButton>
                    </StackItem>
                  </FooterButtonsContainer>
                </FooterContainer>
              </StepContainer>
            )}

            {activeStep.order === 2 && map && (
              <StepContainer verticalType={Stack.HORIZONTAL_TYPE.CENTER}>
                <StackItem>
                  <h1>Define Locations</h1>
                </StackItem>
                <FormContainer verticalType={Stack.HORIZONTAL_TYPE.CENTER}>
                  <DefineLocations
                    map={map}
                    onMapLocationWrite={this.onMapLocationWrite}
                    mapLocations={mapLocations}
                    mapLocationsLoading={mapLocationsLoading}
                    mapLocationsLoadingErrors={mapLocationsLoadingErrors}
                    selectedLatLng={selectedLatLng}
                  />
                </FormContainer>
                <FooterContainer>
                  <FooterButtonsContainer
                    verticalType={Stack.VERTICAL_TYPE.CENTER}
                  >
                    <StackItem>
                      <Button
                        sizeType={Button.SIZE_TYPE.LARGE}
                        type={Button.TYPE.SECONDARY}
                        onClick={this.previousStep}
                        iconType={
                          Button.ICON_TYPE.INTERFACE__CHEVRON__CHEVRON_LEFT
                        }
                      >
                        Back
                      </Button>
                    </StackItem>
                    <StackItem>
                      <StyledButton
                        sizeType={Button.SIZE_TYPE.LARGE}
                        type={Button.TYPE.PRIMARY}
                        onClick={this.nextStep}
                        iconType={
                          Button.ICON_TYPE.INTERFACE__CHEVRON__CHEVRON_RIGHT
                        }
                      >
                        Continue
                      </StyledButton>
                    </StackItem>
                  </FooterButtonsContainer>
                </FooterContainer>
              </StepContainer>
            )}

            {activeStep.order === 3 && (
              <StepContainer verticalType={Stack.HORIZONTAL_TYPE.CENTER}>
                <StackItem>
                  <h1>Map entities to locations</h1>
                </StackItem>
                <FormContainer verticalType={Stack.HORIZONTAL_TYPE.CENTER}>
                  <MapLocationData
                    accountId={accountId}
                    map={map}
                    mapLocations={mapLocations}
                    mapLocationsLoading={mapLocationsLoading}
                    mapLocationsLoadingErrors={mapLocationsLoadingErrors}
                    onMapLocationWrite={this.onMapLocationWrite}
                  />
                </FormContainer>
                <FooterContainer>
                  <FooterButtonsContainer
                    verticalType={Stack.VERTICAL_TYPE.CENTER}
                  >
                    <StackItem>
                      <Button
                        sizeType={Button.SIZE_TYPE.LARGE}
                        type={Button.TYPE.SECONDARY}
                        onClick={this.previousStep}
                        iconType={
                          Button.ICON_TYPE.INTERFACE__CHEVRON__CHEVRON_LEFT
                        }
                      >
                        Back
                      </Button>
                    </StackItem>
                    <StackItem>
                      <Button
                        sizeType={Button.SIZE_TYPE.LARGE}
                        type={Button.TYPE.PRIMARY}
                        onClick={() =>
                          navigation.router({
                            to: 'viewMap',
                            state: { selectedMap: map }
                          })
                        }
                      >
                        View Map
                      </Button>
                    </StackItem>
                  </FooterButtonsContainer>
                </FooterContainer>
              </StepContainer>
            )}
          </LocationsTable>
          <MapContainer columnSpan={6}>
            <GeoMap
              map={map}
              mapLocations={mapLocations}
              // onMarkerClick={marker => console.log(marker)}
              onMapClick={this.onMapClick}
              onZoomEnd={this.onZoomEnd}
              center={mapCenter}
              zoom={mapZoomLevel}
            />
          </MapContainer>
        </StyledGrid>
      </>
    );
  }
}
