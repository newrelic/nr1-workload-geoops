/* eslint-disable react/no-did-update-set-state */
import React from 'react';
import PropTypes from 'prop-types';

import cloneDeep from 'lodash.clonedeep';
import { Button, Modal, Spinner, Stack, StackItem } from 'nr1';

import {
  DEFINE_LOCATIONS_UI_SCHEMA,
  MAP_LOCATION_JSON_SCHEMA,
  MAP_LOCATION_DEFAULTS
} from '../shared/constants';

import { NerdGraphError } from '@newrelic/nr1-community';
import JsonSchemaForm from '../shared/components/JsonSchemaForm';

import { getLocation, writeLocation } from '../shared/services/location';
import { writeMapLocation } from '../shared/services/map-location';
import LocationTable from '../shared/components/LocationTable';
import MapLocationFilesUpload from './MapLocationFilesUpload';

export default class DefineLocations extends React.PureComponent {
  static propTypes = {
    accountId: PropTypes.number,
    map: PropTypes.object.isRequired,
    onMapLocationWrite: PropTypes.func,
    mapLocations: PropTypes.array,
    mapLocationsLoading: PropTypes.bool,
    mapLocationsLoadingErrors: PropTypes.array,
    // TO DO - custom validation for an array containing [ lat, lng ]
    selectedLatLng: PropTypes.oneOfType([PropTypes.array, PropTypes.bool])
  };

  constructor(props) {
    super(props);

    this.state = {
      isValidatingFile: false,
      files: [],
      uiSchema: this.transformUiSchema(DEFINE_LOCATIONS_UI_SCHEMA),
      schema: this.transformSchema(MAP_LOCATION_JSON_SCHEMA),
      formData: { map: props.map.guid }
    };

    this.addLocationForm = React.createRef();
    this.onWrite = this.onWrite.bind(this);
    this.onAddFileMapLocations = this.onAddFileMapLocations.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.selectedLatLng &&
      this.props.selectedLatLng !== prevProps.selectedLatLng
    ) {
      this.setState(prevState => ({
        formData: {
          ...prevState.formData,
          location: {
            lat: this.props.selectedLatLng[0],
            lng: this.props.selectedLatLng[1]
          }
        }
      }));
    }
  }

  transformUiSchema(inSchema) {
    const schema = cloneDeep(inSchema);

    // Remove fields for this step
    // const mapLocationJsonSchema = {};

    return schema;
  }

  /*
   * Remove fields that will be filled in the next step
   */
  transformSchema(inSchema) {
    const schema = cloneDeep(inSchema);

    delete schema.properties.query;
    delete schema.properties.entities;
    delete schema.properties.map;
    delete schema.properties.location.properties.title;
    return schema;
  }

  /*
   * Manual definition of MapLocations
   */

  // As they add locations we need to associate them with _this_ map
  // We do so by creating a MapLocation object for each

  async onWrite({ document, error: locationWriteError }) {
    const { document: location } = document;
    const {
      data: mapLocation,
      error: mapLocationWriteError
    } = await this.writeMapLocation({ location });

    this.props.onMapLocationWrite({
      mapLocation: {
        data: mapLocation.nerdStorageWriteDocument,
        error: mapLocationWriteError
      }
    });
  }

  async writeMapLocation({ location }) {
    const { accountId, map } = this.props;

    if (!location.guid || !map.guid) {
      throw new Error('Error: missing location or map guids');
    }

    // location.map = map.guid;

    return writeMapLocation({
      accountId,
      document: location
    });
  }

  /*
   * File-based additions of MapLocations
   */

  async onAddFileMapLocations({ mapLocations }) {
    await Promise.all(
      mapLocations.map(async ml => {
        const {
          data: mapLocation,
          error: mapLocationWriteError
        } = await this.writeMapLocation({
          location: { ...ml, map: this.props.map.guid }
        });

        this.props.onMapLocationWrite({
          mapLocation: {
            data: mapLocation.nerdStorageWriteDocument,
            error: mapLocationWriteError
          }
        });
      })
    );

    this.setState({ isValidatingFile: false });
  }

  /*
  File: {
    name: "map-location-upload-file.json"
    lastModified: 1582219355387
    lastModifiedDate: Thu Feb 20 2020 12:22:35 GMT-0500 (Eastern Standard Time) {}
    webkitRelativePath: ""
    size: 90
    type: "application/json"
  }
  */
  fileInputOnChange(event) {
    const fileList = event.target.files;
    this.setState({ files: Array.from(fileList) });
  }

  render() {
    const {
      accountId,
      mapLocations,
      mapLocationsLoading,
      mapLocationsLoadingErrors
    } = this.props;

    const { files, formData, isValidatingFile, uiSchema, schema } = this.state;

    return (
      <>
        <h4>File Upload</h4>
        <p>
          JSON file formatted to <a href="#">this specification</a>. We
          recommend this method for providing locations.
        </p>
        <input
          type="file"
          className="json-file-upload"
          accept=".json"
          onChange={event => {
            this.setState({ isValidatingFile: true });
            this.fileInputOnChange(event);
          }}
          onClick={event => {
            event.target.value = null;
          }}
        />
        <hr className="or-sep" />
        <h4>Define locations manually</h4>
        <p>
          Either provide the data for the fields below, or click a point on the
          map to the right.
        </p>

        {/* Column 1 */}
        <JsonSchemaForm
          ref={this.addLocationForm}
          accountId={accountId}
          guid={false}
          schema={schema}
          uiSchema={uiSchema}
          defaultValues={MAP_LOCATION_DEFAULTS}
          formData={formData}
          getDocument={getLocation}
          writeDocument={writeLocation}
          onWrite={this.onWrite}
          onError={errors => console.log(errors)}
          className="define-locations-form"
        >
          <Stack fullWidth horizontalType={Stack.HORIZONTAL_TYPE.CENTER}>
            <StackItem>
              <Button
                type={Button.TYPE.PRIMARY}
                onClick={() => this.addLocationForm.current.submit()}
                iconType={Button.ICON_TYPE.INTERFACE__SIGN__PLUS}
              >
                Add location
              </Button>
            </StackItem>
          </Stack>
        </JsonSchemaForm>

        {/* Column 2 */}
        {mapLocationsLoading && <Spinner />}

        {/* Errors */}
        {/* {!locationsLoading &&
          locationLoadingErrors &&
          locationLoadingErrors.length > 0 &&
          locationLoadingErrors.map((error, index) => {
            return <NerdGraphError key={index} error={error} />;
          })} */}

        {/* List of locations */}
        {!mapLocationsLoading && <LocationTable mapLocations={mapLocations} />}

        <Modal
          hidden={!isValidatingFile}
          onClose={() => this.setState({ isValidatingFile: false })}
        >
          <MapLocationFilesUpload
            files={files}
            onAddFileMapLocations={this.onAddFileMapLocations}
          />
        </Modal>
      </>
    );
  }
}
