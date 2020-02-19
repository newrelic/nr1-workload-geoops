import React from 'react';
import PropTypes from 'prop-types';
import { Map, TileLayer } from 'react-leaflet';

import { Button, Grid, GridItem, Stack, StackItem } from 'nr1';

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
import { getLocations } from '../shared/services/location';

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
    accountId: PropTypes.number,
    onMapChange: PropTypes.func,

    // Optional - pick up where they left off with a specific map
    // We "map" this onto local state
    map: PropTypes.object,
    navigation: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      steps,
      activeStep: steps.find(s => s.order === 1),
      map: props.map,

      locations: [],
      locationsLoading: false,
      locationsLoadingErrors: [],

      mapLocations: [],
      mapLocationsLoading: false,
      mapLocationsLoadingErrors: []
    };

    this.onAddEditMap = this.onAddEditMap.bind(this);
    this.onLocationWrite = this.onLocationWrite.bind(this);
    this.submitForm = this.submitForm.bind(this);
    this.changeActiveStep = this.changeActiveStep.bind(this);
  }

  componentDidMount() {
    this.loadLocations();
    this.loadMapLocations();
  }

  // Based on the current way we're recreating each component on
  // top-level page navigation this isn't necessary, but it will be/could be an optimization
  // componentDidUpdate(prevProps) {
  //   // null (no map) -> map
  //   if (prevProps.map === null && this.props.map) {
  //     // eslint-disable-next-line react/no-did-update-set-state
  //     this.setState({ map: this.props.map });
  //   }

  //   if (prevProps.map && this.props.map) {
  //     if (prevProps.map.guid !== this.props.map.guid) {
  //       this.setState({ map: this.props.map });
  //     }
  //   }
  // }

  async loadLocations() {
    const { accountId, map } = this.props;

    if (map && map.accountId && map.accountId !== accountId) {
      console.warn(
        "The selected map's accountId is different from the selected accountId. This might be unexpected behavior."
      );
    }

    this.setState({ locationsLoading: true });
    // Locations
    const {
      data: locations,
      errors: locationsLoadingErrors
    } = await nerdStorageRequest({
      service: getLocations,
      params: { accountId }
    });

    this.setState({
      locations,
      locationsLoading: false,
      locationsLoadingErrors
    });
  }

  async loadMapLocations() {
    const { accountId, map } = this.props;

    if (map && map.accountId && map.accountId !== accountId) {
      console.warn(
        "The selected map's accountId is different from the selected accountId. This might be unexpected behavior."
      );
    }

    this.setState({ mapLocationsLoading: true });

    const {
      data: mapLocations,
      errors: mapLocationsLoadingErrors
    } = await nerdStorageRequest({
      service: getLocations,
      params: { accountId }
    });

    this.setState({
      mapLocations,
      mapLocationsLoading: false,
      mapLocationsLoadingErrors
    });
  }

  onAddEditMap({ document, error }) {
    const { activeStep } = this.state;

    // TO DO - Expose error about adding/editing

    // eslint-disable-next-line no-console
    console.log([document, error]);

    this.props.onMapChange({ map: document });
    this.setState({
      map: document,
      activeStep: this.nextStep({ step: activeStep })
    });
  }

  // Bubble up both the location and the mapLocation from DefineLocations
  onLocationWrite({ location, mapLocation }) {
    // TO DO - Handle errors from updating each

    this.addOrUpdate({ collectionName: 'locations', item: location.data });
    this.addOrUpdate({
      collectionName: 'mapLocations',
      item: mapLocation.data
    });
  }

  /*
   * field is a local state array that needs updated in an immutable way
   * item is an un-nested nerdstore document that needs wrapped in { id: foo, document: item }
   */
  addOrUpdate({ collectionName, item }) {
    const { [collectionName]: collection } = this.state;

    const itemIndex = collection.findIndex(i => i.document.guid === item.guid);

    const newDocument = { id: item.guid, document: item };

    // Update in place
    if (itemIndex > 0) {
      const updatedCollection = [...collection].splice(
        itemIndex,
        1,
        newDocument
      );

      const newState = {
        [collectionName]: updatedCollection
      };

      this.setState(newState);

      return;
    }

    // Append
    this.setState(prevState => {
      return {
        [collectionName]: [
          ...prevState[collectionName],
          { id: item.guid, document: item }
        ]
      };
    });
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

  submitForm() {
    this.createMapForm.submitButton.click();
  }

  changeActiveStep(destinationStep) {
    this.setState({
      activeStep: steps.find(s => s.order === destinationStep),
      map: {
        document: {
          accountId: 630060,
          centerLat: 22,
          centerLng: -97,
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
    const { accountId, navigation } = this.props;
    const {
      activeStep,
      map,
      steps,
      locations,
      locationsLoading,
      locationsLoadingErrors,
      mapLocations,
      mapLocationsLoading,
      mapLocationsLoadingErrors
    } = this.state;

    const startingCenter = [39.5, -98.35];
    const startingZoom = 4;

    return (
      <>
        <Button
          onClick={navigation.next}
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
                    getDocument={getMap}
                    writeDocument={writeMap}
                    onWrite={this.onAddEditMap}
                    ref={createMapForm => (this.createMapForm = createMapForm)}
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
                        onClick={this.submitForm}
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
                className="get-started-step-contents"
              >
                <StackItem className="get-started-step-contents-header-container">
                  <h1 className="get-started-step-contents-header">
                    Define Locations
                  </h1>
                </StackItem>
                <StackItem className="get-started-step-contents-form-container">
                  <DefineLocations
                    accountId={accountId}
                    map={map}
                    onLocationWrite={this.onLocationWrite}
                    locations={locations}
                    locationsLoading={locationsLoading}
                    locationsLoadingErrors={locationsLoadingErrors}
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
                        onClick={this.submitForm}
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

            {/* TO DO - Handle mapLocations here or inside MapLocationData? */}
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
                        onClick={this.submitForm}
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
            <div className="leaflet-wrapper">
              <Map center={startingCenter} zoomControl zoom={startingZoom}>
                <TileLayer
                  attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </Map>
            </div>
          </GridItem>
        </Grid>
      </>
    );
  }
}
