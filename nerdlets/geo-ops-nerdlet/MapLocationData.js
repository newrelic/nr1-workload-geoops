import React from 'react';
import PropTypes from 'prop-types';

import uuid from 'uuid/v4';
import cloneDeep from 'lodash.clonedeep';
import { Stack, StackItem, Icon } from 'nr1';

import JsonSchemaForm from '../shared/components/JsonSchemaForm';
import { FloatInput } from '../shared/components/react-jsonschema-form';
import EntityTypeAhead from '../shared/components/EntityTypeAhead';

import {
  MAP_LOCATION_UI_SCHEMA,
  MAP_LOCATION_JSON_SCHEMA
} from '../shared/constants';

import {
  formatMapLocation, // Cast from document store to json schema types
  getMapLocation,
  writeMapLocation
} from '../shared/services/map-location';

export default class MapLocationData extends React.Component {
  static propTypes = {
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

  onMapLocationSelect(e) {
    const guid = e.currentTarget.getAttribute('data-guid');
    const mapLocation = this.props.mapLocations.find(
      ml => ml.document.guid === guid
    );

    if (mapLocation) {
      this.setState({ selectedMapLocation: mapLocation });
    }
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

  /*
   * TO DO - How do we want to define isCompleted? Do we want to give users the ability to select this as part of a Map config?
   */
  isCompleted(mapLocationObject) {
    const { document: ml } = mapLocationObject;

    return ml.entities.length > 0 && ml.query !== '';
    // return ml.entities.length > 0 || ml.query !== '';
  }

  render() {
    const { map, mapLocations } = this.props;
    const { selectedMapLocation } = this.state;
    console.log(selectedMapLocation);
    const accountId = map.document.accountId;

    const formData = selectedMapLocation
      ? { ...selectedMapLocation.document }
      : {};

    /*
     * Customize react-jsonschema-form ui
     */
    const uiSchema = cloneDeep(MAP_LOCATION_UI_SCHEMA);
    // uiSchema.entities = { 'ui:field': EntitySearchFormInput };
    uiSchema.entities = { 'ui:field': EntityTypeAhead };
    uiSchema.location = {
      ...uiSchema.location,
      lat: {
        ...uiSchema.location.lat,
        'ui:widget': FloatInput
      },
      lng: {
        ...uiSchema.location.lng,
        'ui:widget': FloatInput
      }
    };

    /*
     * Calculate progress bar
     */
    const completedCount = mapLocations.reduce(
      (previousValue, currentValue) => {
        const isCompleted = this.isCompleted(currentValue);

        if (isCompleted) {
          previousValue = previousValue + 1;
        }

        return previousValue;
      },
      0
    );
    const totalCount = mapLocations.length;

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
                {completedCount} of {totalCount} completed
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
            {mapLocations.map(mapLocationObject => {
              const { document: ml } = mapLocationObject;
              const isCompleted = this.isCompleted(mapLocationObject);

              const isActive =
                selectedMapLocation &&
                selectedMapLocation.document.guid === ml.guid;

              const className = `map-entities-location-list-item
              ${isCompleted ? ' completed' : ''}
              ${isActive ? ' active' : ''}`;

              const { description = false } = ml.location;

              return (
                <li
                  key={ml.guid}
                  className={className}
                  onClick={this.onMapLocationSelect}
                  data-guid={ml.guid}
                >
                  <Stack
                    verticalType={Stack.VERTICAL_TYPE.CENTER}
                    className="map-entities-location-list-item-content"
                  >
                    <StackItem>
                      <div className="map-entities-location-list-item-check" />
                    </StackItem>
                    <StackItem className="map-entities-location-list-item-title">
                      {ml.title}
                    </StackItem>
                    {description && description !== '' && (
                      <StackItem className="map-entities-location-list-item-description">
                        {description}
                      </StackItem>
                    )}
                  </Stack>
                </li>
              );
            })}
          </ul>
          {selectedMapLocation && (
            <JsonSchemaForm
              schema={MAP_LOCATION_JSON_SCHEMA}
              uiSchema={uiSchema}
              defaultValues={false}
              formData={formData}
              fetchDocument={() =>
                getMapLocation({
                  accountId,
                  documentId: selectedMapLocation.document.guid,
                  mapGuid: selectedMapLocation.document.map
                })
              }
              formatDocument={formatMapLocation}
              writeDocument={({ formData }) =>
                writeMapLocation({
                  accountId,
                  documentId: selectedMapLocation.guid,
                  document: formData
                })
              }
              onWrite={({ data, errors }) => console.log([data, errors])}
            />
          )}
        </div>
      </>
    );
  }
}
