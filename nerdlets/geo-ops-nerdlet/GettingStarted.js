import React from 'react';
import PropTypes from 'prop-types';

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
 * <GettingStarted map={map} onMapChange={this.onMapChange} />
 *
 * TO DO:
 *   - A prop for where to pick-up at, i.e. - "startingStep={'create-map'}"
 */
export default class GettingStarted extends React.PureComponent {
  static propTypes = {
    accountId: PropTypes.number,
    onMapChange: PropTypes.func,

    // Optional - pick up where they left off with a specific map
    map: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      steps,
      activeStep: steps.find(s => s.order === 1)
    };

    this.onAddEditMap = this.onAddEditMap.bind(this);
  }

  // eslint-disable-next-line no-unused-vars
  onAddEditMap({ document, error }) {
    const { activeStep } = this.state;

    // TO DO - Expose error about adding/editing
    // ({ data, errors }) => console.log([data, errors])

    this.props.onMapChange({ map: document });
    this.setState({ activeStep: this.nextStep({ step: activeStep }) });
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
    const { accountId, map } = this.props;
    const { activeStep, steps } = this.state;

    return (
      <>
        <h2>Steps</h2>
        <GettingStartedSteps steps={steps} activeStep={activeStep} />

        {activeStep.order === 1 && (
          <>
            <h2>Create a map</h2>
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
          </>
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
            <h2>Canada</h2>
          </>
        )}
      </>
    );
  }
}
