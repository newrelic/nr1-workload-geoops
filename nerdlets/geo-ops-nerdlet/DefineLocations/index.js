/* eslint-disable react/no-did-update-set-state */
import React from 'react';
import PropTypes from 'prop-types';
import cloneDeep from 'lodash.clonedeep';
import { Button, navigation, Spinner, Stack, StackItem } from 'nr1';

import {
  DEFINE_LOCATIONS_UI_SCHEMA,
  MAP_LOCATION_JSON_SCHEMA,
  MAP_LOCATION_DEFAULTS
} from '../../shared/constants';

import { LocationTable } from '../components';
import { writeMapLocation } from '../../shared/services/map-location';

import {
  FileUploadContainer,
  ManualDescription,
  OrLine,
  StyledJsonSchemaForm
} from './styles';

export default class DefineLocations extends React.PureComponent {
  static propTypes = {
    map: PropTypes.object.isRequired,
    onMapLocationWrite: PropTypes.func,
    mapLocations: PropTypes.array,
    mapLocationsLoading: PropTypes.bool,

    selectedLatLng: PropTypes.oneOfType([
      PropTypes.arrayOf(
        PropTypes.shape({
          lat: PropTypes.number.isRequired,
          lng: PropTypes.number.isRequired
        })
      ),
      PropTypes.bool
    ])
  };

  constructor(props) {
    super(props);

    this.state = {
      uiSchema: this.transformUiSchema(DEFINE_LOCATIONS_UI_SCHEMA),
      schema: this.transformSchema(MAP_LOCATION_JSON_SCHEMA),
      formData: { map: props.map.guid }
    };

    this.addLocationForm = React.createRef();
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

  onWrite = async ({ data }) => {
    const { document: location } = data;

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
  };

  writeMapLocation = async ({ location }) => {
    const { map } = this.props;
    const { accountId } = map;

    if (!location.guid || !map.guid) {
      throw new Error('Error: missing location or map guids');
    }

    return writeMapLocation({
      accountId,
      document: location
    });
  };

  /*
   * File-based additions of MapLocations
   */

  onAddFileMapLocations = async ({ mapLocations }) => {
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
  };

  onUploadFileButtonClick = e => {
    e.preventDefault();
    const {
      map: { accountId, guid }
    } = this.props;

    navigation.openStackedNerdlet({
      id: 'map-location-upload',
      urlState: {
        accountId: accountId,
        map: guid
      }
    });
  };

  render() {
    const { map, mapLocations, mapLocationsLoading } = this.props;
    const { formData, uiSchema, schema } = this.state;

    return (
      <>
        <FileUploadContainer>
          <h4>File Upload</h4>
          <p>
            JSON file formatted to{' '}
            <a
              href="https://github.com/newrelic/nr1-workload-geoops/blob/main/docs/data-dictionary.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              this specification
            </a>{' '}
            or{' '}
            <a
              href="https://github.com/newrelic/nr1-workload-geoops/tree/main/examples"
              target="_blank"
              rel="noopener noreferrer"
            >
              these examples
            </a>
            . We recommend this method for providing locations.
          </p>
          <Button onClick={this.onUploadFileButtonClick}>
            Upload JSON file
          </Button>
        </FileUploadContainer>
        <OrLine />
        <ManualDescription>
          <h4>Define locations manually</h4>
          <p>
            Either provide the data for the fields below, or click a point on
            the map to the right.
          </p>
        </ManualDescription>

        <StyledJsonSchemaForm
          ref={this.addLocationForm}
          schema={schema}
          uiSchema={uiSchema}
          defaultValues={MAP_LOCATION_DEFAULTS}
          formData={formData}
          fetchDocument={null}
          writeDocument={({ formData }) =>
            writeMapLocation({
              accountId: map.accountId,
              document: formData
            })
          }
          onWrite={this.onWrite}
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
        </StyledJsonSchemaForm>

        {mapLocationsLoading && <Spinner />}
        {!mapLocationsLoading && <LocationTable mapLocations={mapLocations} />}
      </>
    );
  }
}
