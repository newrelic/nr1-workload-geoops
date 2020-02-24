import React from 'react';
import PropTypes from 'prop-types';

import { Button } from 'nr1';

import uuid from 'uuid/v4';
import get from 'lodash.get';
import cloneDeep from 'lodash.clonedeep';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import Ajv from 'ajv';

import { MAP_LOCATION_JSON_SCHEMA } from '../shared/constants';
import { writeMapLocation } from '../shared/services/map-location';

export default class MapLocationFilesUpload extends React.Component {
  static propTypes = {
    accountId: PropTypes.number,
    mapGuid: PropTypes.string,
    files: PropTypes.array,
    onClose: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      fileErrors: null,
      fileData: [],
      mapLocationSuccesses: [],
      mapLocationErrors: []
    };
  }

  async componentDidMount() {
    await this.loadFiles();
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.files !== this.props.files) {
      await this.loadFiles();
    }
  }

  close() {
    this.props.onClose();
  }

  async loadFiles() {
    const { files } = this.props;
    const schema = cloneDeep(MAP_LOCATION_JSON_SCHEMA);
    schema.required = schema.required.filter(
      v => v !== 'map' && v !== 'location'
    );
    delete schema.properties.map;
    delete schema.properties.location;

    // According to the "spec" we've asked them to adhere to
    const pathToLocations = 'items';

    const promises = files.map(
      file =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = result => {
            const bodyAsString = result.target.result;
            const bodyAsJson = JSON.parse(bodyAsString);

            if (!bodyAsString || !bodyAsJson) {
              reject(new Error('Failed to parse file as JSON'));
            }

            const data = get(bodyAsJson, pathToLocations, []);

            // TO DO - loop through and validate every row
            // We can display these in a separate area/table or
            // add a column to display ones with errors for easy investigation/fixing by the user
            const first = data[0];
            //

            const {
              success: schemaValidated,
              errors: schemaErrors
            } = this.jsonFileIsValid({
              schema,
              data: first
            });

            if (!schemaValidated) {
              // eslint-disable-next-line prefer-promise-reject-errors
              reject({
                success: false,
                result: [],
                errors: schemaErrors
              });
            }

            resolve({ success: true, result: data, errors: null });
          };

          reader.readAsText(file);
        })
    );

    const promiseResults = await Promise.all(
      promises.map(p => p.catch(e => e))
    );
    const fileErrors = promiseResults.filter(result => !result.success);
    const fileSucesses = promiseResults.filter(result => result.success);

    // console.log('Promise Results: ');
    // console.log(promiseResults);

    const fileData = fileSucesses.reduce((previousValue, currentValue) => {
      return previousValue.concat(currentValue.result);
    }, []);

    // console.log('Reduction data:');
    // console.log(fileData);

    const formatted = fileData.map(item => {
      if (item.guid === '1111-1111-1111-1111' || !item.guid) {
        item.guid = uuid();
      }
      return item;
    });

    this.setState({ fileData: formatted, fileErrors });
  }

  jsonFileIsValid({ schema, data }) {
    const ajv = new Ajv();
    const valid = ajv.validate(schema, data);

    if (!valid) {
      // console.log(ajv.errors);
      return { success: false, errors: ajv.errors };
    }

    return { success: true, errors: null };
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

  async writeMapLocation({ location }) {
    const { accountId } = this.props;

    if (!location.guid || !location.map) {
      throw new Error('Error: missing location or map guids');
    }

    return writeMapLocation({
      accountId,
      document: location
    });
  }

  async onAdd({ mapLocations }) {
    const { mapGuid } = this.props;
    await Promise.all(
      mapLocations.map(async ml => {
        const {
          data: mapLocation,
          error: mapLocationWriteError
        } = await this.writeMapLocation({
          location: { ...ml, map: mapGuid }
        });

        this.onMapLocationWrite({
          mapLocation: {
            data: mapLocation.nerdStorageWriteDocument,
            error: mapLocationWriteError
          }
        });
      })
    );
  }

  onMapLocationWrite({ mapLocation }) {
    const { data, error } = mapLocation;

    // Add to errors
    if (error) {
      this.addOrUpdate({
        collectionName: 'mapLocationErrors',
        item: data
      });
    }

    // Add to successes
    if (!error) {
      this.addOrUpdate({
        collectionName: 'mapLocationSuccesses',
        item: data
      });
    }

    // TO DO - We should enhance this to add success/failure to the table
    // - this.setState() and include a status and error column of data to fileData
    // - dynamically change the result of getColumns based on whether we've processed (tried to write map locations) a file or not
    /*
      this.setState({ writingMapMarkers: true }); // Put this onAdd
      this.deleteFromCollection({
        fileData: 'mapLocation',
        item: mapLocation.data,
        key: 'guid'
      })
    */
  }

  getColumns() {
    const columns = [
      {
        dataField: 'guid',
        text: 'GUID',
        sort: true
      },
      {
        dataField: 'title',
        text: 'Title',
        sort: true
      },
      {
        dataField: 'location.guid',
        text: 'Location GUID',
        sort: true
      },
      {
        dataField: 'location.lat',
        text: 'Location Lat',
        sort: true
      },
      {
        dataField: 'location.lng',
        text: 'Location Lng',
        sort: true
      },
      {
        dataField: 'entities',
        formatter: (cell, row) => {
          if (!row.entities) {
            return '';
          }

          const guids = row.entities.map(e => e.guid);
          return guids.join(',');
        },
        text: 'Entities',
        sort: true
      }
    ];
    return columns;
  }

  renderFileErrors(errors) {
    return (
      <>
        {errors.map((err, index) => (
          <pre key={index}>{JSON.stringify(err, null, 2)}</pre>
        ))}
      </>
    );
  }

  render() {
    const { SearchBar } = Search;
    const {
      fileErrors,
      fileData,
      mapLocationSuccesses,
      mapLocationErrors
    } = this.state;

    const columns = this.getColumns();

    return (
      <>
        {mapLocationSuccesses.length > 0 && (
          <h2>Successfully added: {mapLocationSuccesses.length} markers.</h2>
        )}

        {mapLocationErrors.length > 0 && (
          <h2>Errors adding: {mapLocationErrors.length} markers.</h2>
        )}

        {fileErrors && this.renderFileErrors(fileErrors)}

        {fileData && (
          <>
            <ToolkitProvider
              keyField="guid"
              data={fileData}
              columns={columns}
              search
            >
              {props => (
                <div>
                  <SearchBar {...props.searchProps} />
                  <BootstrapTable {...props.baseProps} bordered={false} />
                </div>
              )}
            </ToolkitProvider>
            <Button
              onClick={() => this.onAdd({ mapLocations: fileData })}
              type={Button.TYPE.PRIMARY}
              iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__NOTES__A_ADD}
            >
              Add to Map
            </Button>
          </>
        )}

        <Button
          onClick={() => this.close()}
          type={Button.TYPE.PRIMARY}
          iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__NOTES__A_ADD}
        >
          Close
        </Button>
      </>
    );
  }
}
