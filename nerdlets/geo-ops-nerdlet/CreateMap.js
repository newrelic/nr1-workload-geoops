import React from 'react';
import PropTypes from 'prop-types';
import GeoMap from './geo-map';
import { Map, TileLayer } from 'react-leaflet';

import {
  Button,
  Grid,
  GridItem,
  NerdletStateContext,
  Stack,
  StackItem
} from 'nr1';

import GettingStartedSteps from '../shared/components/GettingStartedSteps';
import JsonSchemaForm from '../shared/components/JsonSchemaForm';
import DefineLocations from './DefineLocations';
import MapLocationData from './MapLocationData';

import { nerdStorageRequest } from '../shared/utils';

import {
  MAP_UI_SCHEMA,
  MAP_JSON_SCHEMA,
  MAP_DEFAULTS
} from '../shared/constants';

import { getMap, writeMap } from '../shared/services/map';
import { getMapLocations } from '../shared/services/map-location';

import AccountDropdown from '../shared/components/AccountDropdown';

const steps = [
  { order: 1, title: '1. Create a map' },
  { order: 2, title: '2. Define Locations' },
  { order: 3, title: '3. Map Entities to Locations' }
];

/*
 * Usage:
 * <CreateMap map={map} onMapChange={this.onMapChange} />
 *
 * TO DO:
 *   - A prop for where to pick-up at, i.e. - "startingStep={'create-map'}"
 */
export default class CreateMap extends React.PureComponent {
  static propTypes = {
    onMapChange: PropTypes.func,

    // Optional - pick up where they left off with a specific map
    // We "map" this onto local state
    map: PropTypes.object,
    navigation: PropTypes.object,
    activeStep: PropTypes.number,
    reload: PropTypes.bool
  };

  constructor(props) {
    super(props);

    const defaultFirstStep = steps.find(s => s.order === 1);
    const activeStep = steps.find(s => s.order === props.activeStep);

    this.state = {
      accountId: null,
      steps,
      activeStep: activeStep || defaultFirstStep,
      map: props.map,
      mapLocations: [],
      mapLocationsLoading: false,
      mapLocationsLoadingErrors: [],
      selectedLatLng: false,
      mapZoomLevel: 4,
      mapCenter: [39.5, -98.35]
    };

    this.onAddEditMap = this.onAddEditMap.bind(this);
    this.onMapLocationWrite = this.onMapLocationWrite.bind(this);
    this.changeActiveStep = this.changeActiveStep.bind(this);
    this.onMapClick = this.onMapClick.bind(this);
    this.onZoomEnd = this.onZoomEnd.bind(this);

    this.createMapForm = React.createRef();
  }

  componentDidMount() {
    const { map } = this.state;

    if (map) {
      this.loadMapLocations();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.reload !== this.props.reload && this.props.reload) {
      console.log('Reloading map locations');
      this.loadMapLocations();
    }
  }

  async loadMapLocations() {
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
  }

  onAddEditMap({ data, error }) {
    const { activeStep } = this.state;
    const nextStep = this.nextStep({ step: activeStep });
    const { document } = data;

    // TO DO - Expose error about adding/editing

    this.setState({ map: document, activeStep: nextStep }, () =>
      this.props.onMapChange({ map: document, activeStep: nextStep })
    );
  }

  onMapLocationWrite({ mapLocation }) {
    // TO DO - Handle errors from updating each
    this.addOrUpdate({
      collectionName: 'mapLocations',
      item: mapLocation.data
    });
  }

  onMapClick(e) {
    const { activeStep } = this.state;
    const { lat, lng } = e.latlng;

    // Specific to map click on step 1
    if (activeStep.order === 1) {
      this.setState({
        mapCenter: [lat, lng]
      });
    }

    this.setState({
      selectedLatLng: [lat, lng]
    });

  onZoomEnd(e) {
    const zoom = e.target._animateToZoom;
    this.setState(prevState => ({
      mapFormData: {
        ...prevState,
        zoom
      }
    }));
  }

  /*
   * collectionName is a local state array that needs updated in an immutable way
   * item is an un-nested nerdstore document that needs wrapped in { id: foo, document: item }
   */
  addOrUpdate({ collectionName, item }) {
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
  }

  // Given a step, determine the "next" one
  nextStep({ step }) {
    const { steps } = this.state;

    const order = step.order;
    const nextStep = steps.find(s => s.order === order + 1);

    // TO DO:
    if (!nextStep) {
      // Final? Change/bump state to viewing the map?
    }

    return nextStep;
  }

  changeActiveStep(destinationStep) {
    this.setState({
      activeStep: steps.find(s => s.order === destinationStep),
      map: {
        document: {
          accountId: 630060,
          lat: 22,
          lng: -97,
          description:
            'Nulla quis tortor orci. Etiam at risus et justo dignissim.',
          guid: 'f0271857-a864-4a4b-a765-6255b52e0029',
          title: 'test mappy',
          zoom: 5
        }
      }
    });
  }

  render() {
    const { navigation } = this.props;
    const {
      accountId,
      activeStep,
      map,
      steps,
      mapLocations,
      mapLocationsLoading,
      mapLocationsLoadingErrors,
      selectedLatLng,
      mapZoomLevel,
      mapCenter
    } = this.state;

    MAP_UI_SCHEMA.accountId['ui:field'] = AccountDropdown;
    const mapFormData = { lat: selectedLatLng[0], lng: selectedLatLng[1] };

    return (
      <>
        <Button
          onClick={() => navigation.router({ to: 'mapList' })}
          type={Button.TYPE.PRIMARY}
          iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__NOTES__A_ADD}
          className="temporary-all-maps-btn"
        >
          Map List
        </Button>
        <Grid
          className="primary-grid getting-started-primary-grid"
          spacingType={[Grid.SPACING_TYPE.NONE, Grid.SPACING_TYPE.NONE]}
        >
          <GridItem
            columnSpan={6}
            fullHeight
            className="locations-table-grid-item"
            collapseGapAfter
          >
            <GettingStartedSteps
              steps={steps}
              activeStep={activeStep}
              tempNavigation={step => this.changeActiveStep(step)}
            />

            {activeStep.order === 1 && (
              <Stack
                verticalType={Stack.HORIZONTAL_TYPE.CENTER}
                className="get-started-step-contents"
              >
                <StackItem className="get-started-step-contents-header-container">
                  <h1 className="get-started-step-contents-header">
                    Create a map
                  </h1>
                </StackItem>
                <StackItem className="get-started-step-contents-form-container">
                  <JsonSchemaForm
                    accountId={accountId}
                    guid={map ? map.guid : false}
                    schema={MAP_JSON_SCHEMA}
                    uiSchema={MAP_UI_SCHEMA}
                    defaultValues={MAP_DEFAULTS}
                    formData={mapFormData}
                    getDocument={getMap}
                    writeDocument={writeMap}
                    onWrite={this.onAddEditMap}
                    onError={errors => console.log('Form errors: ', errors)}
                    onChange={({ formData }) => {
                      if (formData.zoom) {
                        this.setState({ mapZoomLevel: formData.zoom });
                      }
                      if (formData.accountId) {
                        this.setState({ accountId: formData.accountId });
                      }
                    }}
                    ref={this.createMapForm}
                  />
                </StackItem>
                <StackItem className="get-started-step-contents-CTA-container">
                  <Stack
                    verticalType={Stack.VERTICAL_TYPE.CENTER}
                    className="get-started-step-contents-CTAs"
                  >
                    <StackItem>
                      <Button
                        sizeType={Button.SIZE_TYPE.LARGE}
                        type={Button.TYPE.SECONDARY}
                      >
                        Cancel
                      </Button>
                    </StackItem>
                    <StackItem>
                      <Button
                        sizeType={Button.SIZE_TYPE.LARGE}
                        type={Button.TYPE.PRIMARY}
                        onClick={() => this.createMapForm.current.submit()}
                        iconType={
                          Button.ICON_TYPE.INTERFACE__CHEVRON__CHEVRON_RIGHT
                        }
                        className="getting-started-continue-button"
                      >
                        Continue
                      </Button>
                    </StackItem>
                  </Stack>
                </StackItem>
              </Stack>
            )}

            {activeStep.order === 2 && map && (
              <Stack
                verticalType={Stack.HORIZONTAL_TYPE.CENTER}
                className="get-started-step-contents step-define-locations"
              >
                <StackItem className="get-started-step-contents-header-container">
                  <h1 className="get-started-step-contents-header">
                    Define Locations
                  </h1>
                </StackItem>
                <StackItem className="get-started-step-contents-form-container">
                  <DefineLocations
                    map={map}
                    onMapLocationWrite={this.onMapLocationWrite}
                    mapLocations={mapLocations}
                    mapLocationsLoading={mapLocationsLoading}
                    mapLocationsLoadingErrors={mapLocationsLoadingErrors}
                    selectedLatLng={selectedLatLng}
                  />
                </StackItem>
                <StackItem className="get-started-step-contents-CTA-container">
                  <Stack
                    verticalType={Stack.VERTICAL_TYPE.CENTER}
                    className="get-started-step-contents-CTAs"
                  >
                    <StackItem>
                      <Button
                        sizeType={Button.SIZE_TYPE.LARGE}
                        type={Button.TYPE.SECONDARY}
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
                          this.setState({
                            activeStep: this.nextStep({ step: activeStep })
                          })
                        }
                        iconType={
                          Button.ICON_TYPE.INTERFACE__CHEVRON__CHEVRON_RIGHT
                        }
                        className="getting-started-continue-button"
                      >
                        Continue
                      </Button>
                    </StackItem>
                  </Stack>
                </StackItem>
              </Stack>
            )}

            {activeStep.order === 3 && (
              <Stack
                verticalType={Stack.HORIZONTAL_TYPE.CENTER}
                className="get-started-step-contents"
              >
                <StackItem className="get-started-step-contents-header-container">
                  <h1 className="get-started-step-contents-header">
                    Map entities to locations
                  </h1>
                </StackItem>
                <StackItem className="get-started-step-contents-form-container">
                  <MapLocationData
                    accountId={accountId}
                    map={map}
                    mapLocations={mapLocations}
                    mapLocationsLoading={mapLocationsLoading}
                    mapLocationsLoadingErrors={mapLocationsLoadingErrors}
                  />
                </StackItem>
                <StackItem className="get-started-step-contents-CTA-container">
                  <Stack
                    verticalType={Stack.VERTICAL_TYPE.CENTER}
                    className="get-started-step-contents-CTAs"
                  >
                    <StackItem>
                      <Button
                        sizeType={Button.SIZE_TYPE.LARGE}
                        type={Button.TYPE.SECONDARY}
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
                      >
                        Continue
                      </Button>
                    </StackItem>
                  </Stack>
                </StackItem>
              </Stack>
            )}
          </GridItem>
          <GridItem className="primary-content-container" columnSpan={6}>
            <GeoMap
              map={map}
              mapLocations={mapLocations}
              onMarkerClick={marker => console.log(marker)}
              onMapClick={this.onMapClick}
              onZoomEnd={this.onZoomEnd}
              center={mapCenter}
              zoom={mapZoomLevel}
            />
          </GridItem>
        </Grid>
      </>
    );
  }
}
