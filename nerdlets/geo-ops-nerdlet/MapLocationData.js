import React from 'react';
import PropTypes from 'prop-types';
import cloneDeep from 'lodash.clonedeep';

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

    return (
      <>
        <h2>Provide Location Data</h2>
        <span>
          Select a map location and then choose an entity to associate with the
          location
        </span>

        {/* 1 */}
        {/* Map location list with an onSelect callback */}
        {/* <MapLocationList onSelect={this.onMapLocationSelect} */}

        {/* 2 */}
        {/* Entity Search/Associate component with a callback for onChange/onSelect etc. */}
        {/* <RelatedEntities entities={selectMapLocation.relatedEntities} onChange={this.onRelatedEntityChange}/> */}
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
      </>
    );
  }
}
