import React from 'react';
import PropTypes from 'prop-types';
import cloneDeep from 'lodash.clonedeep';

import { Stack, StackItem, Button, Grid, GridItem, Modal } from 'nr1';
import JsonSchemaForm from '../shared/components/JsonSchemaForm';

import {
  MAP_UI_SCHEMA,
  MAP_JSON_SCHEMA,
  MAP_DEFAULTS,
  LOCATION_UI_SCHEMA,
  LOCATION_JSON_SCHEMA,
  MAP_LOCATION_UI_SCHEMA,
  MAP_LOCATION_JSON_SCHEMA
} from '../shared/constants';

import { getMap, writeMap } from '../shared/services/map';
import { getLocation, writeLocation } from '../shared/services/location';
import {
  getMapLocation,
  writeMapLocation
} from '../shared/services/map-location';

const updateSchemaWithState = function({ schema, transforms }) {
  const newSchema = cloneDeep(schema);

  transforms.forEach(t => {
    const { items, property, field, value } = t;
    if (items.length > 0) {
      if (!newSchema.properties[property]) {
        throw new Error('Property not found in schema');
      }

      const options = items.map(i => value(i));
      newSchema.properties[property][field] = options;
      // debugger;
      return newSchema;
    }
  });

  return newSchema;
};

export default class GeoMapEdit extends React.PureComponent {
  static propTypes = {
    accountId: PropTypes.number,
    map: PropTypes.object,
    maps: PropTypes.array,
    locations: PropTypes.array,
    // mapLocations: PropTypes.array,
    callbacks: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      map: props.map,

      // Modals
      addMapModal: false,
      addLocationModal: false,
      addMapLocationModal: false,
      editMapModal: false
    };

    this.callbacks = {
      onAddEditMap: this.onAddEditMap.bind(this),
      onAddMapLocation: this.onAddMapLocation.bind(this)
    };
  }

  /*
   * Without developing a custom ui component, we can inject enum values and names to populate
   * standard ui select options, storing the guid as the reference
   */
  injectSchemaOptions({ maps, locations }) {
    // Merge live data into the schema for the forms
    const MAP_LOCATION_SCHEMA = updateSchemaWithState({
      schema: MAP_LOCATION_JSON_SCHEMA,
      transforms: [
        {
          items: maps,
          property: 'map',
          field: 'enum',
          value: item => item.document.guid
        },
        {
          items: maps,
          property: 'map',
          field: 'enumNames',
          value: item =>
            item.document.title || item.document.name || item.document.guid
        },
        {
          items: locations,
          property: 'location',
          field: 'enum',
          value: item => item.document.guid
        },
        {
          items: locations,
          property: 'location',
          field: 'enumNames',
          value: item =>
            item.document.title || item.document.name || item.document.guid
        }
      ]
    });

    return { MAP_LOCATION_SCHEMA };
  }

  // eslint-disable-next-line no-unused-vars
  onAddEditMap({ document, error }) {
    // TO DO - Splice into this.state.maps
    // TO DO - What if there are errors?
    // ({ data, errors }) => console.log([data, errors])
    this.setState({ map: document });
  }

  onAddMapLocation({ document, error }) {
    const { callbacks } = this.props;
    const { onMapLocationChange } = callbacks;

    if (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }

    onMapLocationChange({ document });
  }

  render() {
    const { accountId, maps, locations } = this.props;
    // const { setParentState } = callbacks;

    const {
      map,
      addMapModal,
      editMapModal,
      addLocationModal,
      addMapLocationModal
    } = this.state;

    const { MAP_LOCATION_SCHEMA } = this.injectSchemaOptions({
      maps,
      locations
    });
    // debugger;

    return (
      <>
        <Grid>
          <GridItem columnSpan={12}>
            <Button
              onClick={() => this.setState({ addMapModal: true })}
              type={Button.TYPE.PRIMARY}
              iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__NOTES__A_ADD}
            >
              Add Map
            </Button>

            <Button
              onClick={() => this.setState({ addLocationModal: true })}
              type={Button.TYPE.PRIMARY}
              iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__NOTES__A_ADD}
            >
              Add Location
            </Button>

            <Button
              onClick={() => this.setState({ addMapLocationModal: true })}
              type={Button.TYPE.PRIMARY}
              iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__NOTES__A_ADD}
            >
              Add Location to Map
            </Button>

            <Button
              onClick={() => this.setState({ editMapModal: true })}
              type={Button.TYPE.PRIMARY}
              iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__NOTES__A_ADD}
            >
              Edit Current Map
            </Button>
          </GridItem>
        </Grid>

        {/* Modals */}

        {/* Add/Edit Map */}
        {map && (
          <Modal
            hidden={!(addMapModal || editMapModal)}
            onClose={() =>
              this.setState({ addMapModal: false, editMapModal: false })
            }
          >
            <JsonSchemaForm
              accountId={accountId}
              guid={editMapModal ? map.guid : false}
              schema={MAP_JSON_SCHEMA}
              uiSchema={MAP_UI_SCHEMA}
              defaultValues={MAP_DEFAULTS}
              getDocument={getMap}
              writeDocument={writeMap}
              onWrite={this.callbacks.onAddEditMap}
            />
          </Modal>
        )}

        {/* Add Location */}
        <Modal
          hidden={!addLocationModal}
          onClose={() => this.setState({ addLocationModal: false })}
        >
          <JsonSchemaForm
            accountId={accountId}
            guid={false}
            schema={LOCATION_JSON_SCHEMA}
            uiSchema={LOCATION_UI_SCHEMA}
            defaultValues={false}
            getDocument={getLocation}
            writeDocument={writeLocation}
            onWrite={({ data, errors }) => console.log([data, errors])}
          />
        </Modal>

        {/* Add Location to a Map and define aggregate */}
        <Modal
          hidden={!addMapLocationModal}
          onClose={() => this.setState({ addMapLocationModal: false })}
        >
          <JsonSchemaForm
            accountId={accountId}
            guid={false}
            schema={MAP_LOCATION_SCHEMA}
            uiSchema={MAP_LOCATION_UI_SCHEMA}
            defaultValues={false}
            getDocument={getMapLocation}
            writeDocument={writeMapLocation}
            onWrite={this.callbacks.onAddMapLocation}
          />
        </Modal>
      </>
    );
  }
}
