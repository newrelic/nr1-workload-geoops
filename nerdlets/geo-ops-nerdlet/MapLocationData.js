import React from 'react';
import PropTypes from 'prop-types';
import cloneDeep from 'lodash.clonedeep';
import { Stack, StackItem, Icon } from 'nr1';

import JsonSchemaForm from '../shared/components/JsonSchemaForm';
import EntitySearchFormInput from '../shared/components/EntitySearchFormInput';

import {
  MAP_LOCATION_UI_SCHEMA,
  MAP_LOCATION_JSON_SCHEMA
} from '../shared/constants';

import {
  getMapLocation,
  writeMapLocation
} from '../shared/services/map-location';
import EntityTypeAhead from '../shared/components/EntityTypeAhead';

export default class MapLocationData extends React.PureComponent {
  static propTypes = {
    accountId: PropTypes.number,
    map: PropTypes.object,
    mapLocations: PropTypes.array,
    onMapLocationChange: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      selectedMapLocation: null
    };

    this.onMapLocationSelect = this.onMapLocationSelect.bind(this);
    this.onRelatedEntityChange = this.onRelatedEntityChange.bind(this);
  }

  onMapLocationSelect({ mapLocation }) {
    this.setState({ selectedMapLocation: mapLocation });
  }

  async onRelatedEntityChange({ entities }) {
    const { selectedMapLocation } = this.state;

    if (!selectedMapLocation) {
      throw Error('No location selected');
    }

    const updatedMapLocation = cloneDeep(selectedMapLocation);
    updatedMapLocation.relatedEntities = entities;

    const { data, errors } = await writeMapLocation({ updatedMapLocation });
    this.props.onMapLocationChange({ data, errors });
  }

  render() {
    const { accountId } = this.props;
    const { selectedMapLocation } = this.state;

    // Tell react-jsonschema-form to utilize EntitySearchFormInput for the property of 'entities'
    const fields = { entities: EntitySearchFormInput };

    // TO DO - Make adjustment to schema for this specific form - make title a two-column input
    // import { FormInputTwoColumn } from "./components/react-jsonschema-form"
    // MAP_LOCATION_UI_SCHEMA.title = { 'ui:FieldTemplate': FormInputTwoColumn };

    return (
      <>
        <h4>Provide Location Data</h4>
        <p>
          Select a map location and then choose an entity to associate with the
          location
        </p>

        {/* 1 */}
        {/* Map location list with an onSelect callback */}
        {/* <MapLocationList onSelect={this.onMapLocationSelect} */}

        {/* 2 */}
        {/* Entity Search/Associate component with a callback for onChange/onSelect etc. */}
        {/* <RelatedEntities entities={selectMapLocation.relatedEntities} onChange={this.onRelatedEntityChange}/> */}
        <div className="map-entities-to-locations-container">
          <Stack fullHeight className="map-entities-header">
            <StackItem className="map-entities-progress-bar-container">
              <div className="map-entities-progress-bar">
                <div className="map-entities-progress-bar-fill" />
              </div>
              <span className="map-entities-progress-bar-label">
                5 of 20 completed
              </span>
            </StackItem>
            <StackItem className="map-entities-header-navigation-arrows">
              <button
                type="button"
                className="map-entities-header-navigation-arrow map-entities-header-navigation-arrow-left u-unstyledButton"
              >
                <Icon
                  type={Icon.TYPE.INTERFACE__CHEVRON__CHEVRON_LEFT}
                  color="#007e8a"
                />
              </button>
              <button
                type="button"
                className="map-entities-header-navigation-arrow map-entities-header-navigation-arrow-right u-unstyledButton"
              >
                <Icon
                  type={Icon.TYPE.INTERFACE__CHEVRON__CHEVRON_RIGHT}
                  color="#007e8a"
                />
              </button>
            </StackItem>
          </Stack>
          <ul className="map-entities-location-list">
            <li className="map-entities-location-list-item completed">
              <Stack
                verticalType={Stack.VERTICAL_TYPE.CENTER}
                className="map-entities-location-list-item-content"
              >
                <StackItem>
                  <div className="map-entities-location-list-item-check" />
                </StackItem>
                <StackItem className="map-entities-location-list-item-title">
                  Alexandria park centre
                </StackItem>
                <StackItem className="map-entities-location-list-item-description">
                  Nulla quis tortor orci. Etiam at risus et justo dignissim.
                </StackItem>
              </Stack>
            </li>
            <li className="map-entities-location-list-item">
              <Stack
                verticalType={Stack.VERTICAL_TYPE.CENTER}
                className="map-entities-location-list-item-content"
              >
                <StackItem>
                  <div className="map-entities-location-list-item-check" />
                </StackItem>
                <StackItem className="map-entities-location-list-item-title">
                  Toronto bluegrass shopping center
                </StackItem>
                <StackItem className="map-entities-location-list-item-description">
                  Nulla quis tortor orci. Etiam at risus et justo dignissim.
                </StackItem>
              </Stack>
            </li>
            <li className="map-entities-location-list-item">
              <Stack
                verticalType={Stack.VERTICAL_TYPE.CENTER}
                className="map-entities-location-list-item-content"
              >
                <StackItem>
                  <div className="map-entities-location-list-item-check" />
                </StackItem>
                <StackItem className="map-entities-location-list-item-title">
                  Little italy drivethrough
                </StackItem>
                <StackItem className="map-entities-location-list-item-description">
                  Nulla quis tortor orci. Etiam at risus et justo dignissim.
                </StackItem>
              </Stack>
            </li>
          </ul>
          <JsonSchemaForm
            accountId={accountId}
            guid={
              selectedMapLocation
                ? selectedMapLocation.guid || selectedMapLocation.document.guid
                : false
            }
            schema={MAP_LOCATION_JSON_SCHEMA}
            uiSchema={MAP_LOCATION_UI_SCHEMA}
            fields={fields}
            defaultValues={false}
            getDocument={getMapLocation}
            writeDocument={writeMapLocation}
            onWrite={({ data, errors }) => console.log([data, errors])}
          />

          <EntityTypeAhead />
        </div>
      </>
    );
  }
}
