import React from 'react';
import PropTypes from 'prop-types';
import { Map, TileLayer } from 'react-leaflet';

import { Button, Grid, GridItem } from 'nr1';

import GettingStartedSteps from '../shared/components/GettingStartedSteps';
import JsonSchemaForm from '../shared/components/JsonSchemaForm';
import DefineLocations from './DefineLocations';
import MapLocationData from './MapLocationData';

import {
  MAP_UI_SCHEMA,
  MAP_JSON_SCHEMA,
  MAP_DEFAULTS
} from '../shared/constants';

import { getMap, writeMap } from '../shared/services/map';

const steps = [
  { order: 1, title: '1. Create a map' },
  { order: 2, title: '2. Define Locations' },
  { order: 3, title: '3. Provide Data For Locations' },
  { order: 4, title: '4. Canada' }
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
      map: null
    };

    this.onAddEditMap = this.onAddEditMap.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.map && this.props.map) {
      if (prevProps.map.guid !== this.props.map.guid) {
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({ map: this.props.map });
      }
    }
  }

  onAddEditMap({ document, error }) {
    const { activeStep } = this.state;

    // TO DO - Expose error about adding/editing

    // eslint-disable-next-line no-console
    console.log([document, error]);

    // Do we need to wrap the mutation response to get a consistent looking map document?
    // i.e. { document: { guid }} vs. { guid }
    const map = { document };

    this.props.onMapChange({ map });
    this.setState({
      map,
      activeStep: this.nextStep({ step: activeStep })
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

  render() {
    const { accountId, navigation } = this.props;
    const { activeStep, map, steps } = this.state;

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
            <GettingStartedSteps steps={steps} activeStep={activeStep} />

            {activeStep.order === 1 && (
              <div className="get-started-step-contents">
                <h2 className="get-started-step-contents-header">
                  Create a map
                </h2>
                <JsonSchemaForm
                  accountId={accountId}
                  guid={map ? map.document.guid : false}
                  schema={MAP_JSON_SCHEMA}
                  uiSchema={MAP_UI_SCHEMA}
                  defaultValues={MAP_DEFAULTS}
                  getDocument={getMap}
                  writeDocument={writeMap}
                  onWrite={this.onAddEditMap}
                />
              </div>
            )}

            {activeStep.order === 2 && (
              <>
                <h2>Define Locations</h2>
                <DefineLocations accountId={accountId} map={map} />
              </>
            )}

            {/* TO DO - Handle mapLocations here or inside MapLocationData? */}
            {activeStep.order === 3 && (
              <>
                <h2>Provide data for locations</h2>
                <MapLocationData
                  accountId={accountId}
                  map={map}
                  mapLocations={[]}
                />
              </>
            )}

            {activeStep.order === 4 && (
              <>
                <h2>Done</h2>
              </>
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
