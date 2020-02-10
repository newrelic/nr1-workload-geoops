import React from 'react';
import PropTypes from 'prop-types';

import { LOCATION_UI_SCHEMA, LOCATION_JSON_SCHEMA } from '../shared/constants';

import { EmptyState } from '@newrelic/nr1-community';
import JsonSchemaForm from '../shared/components/JsonSchemaForm';
import { getLocation, writeLocation } from '../shared/services/location';
import { writeMapLocation } from '../shared/services/map-location';

export default class DefineLocations extends React.PureComponent {
  static propTypes = {
    accountId: PropTypes.number,
    map: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      //
    };

    this.onWrite = this.onWrite.bind(this);
  }

  // As they add locations we need to associate them with _this_ map
  // eslint-disable-next-line no-unused-vars
  async onWrite({ data, errors }) {
    // TO DO - Handle errors when adding new Locations

    const { accountId, map } = this.props;

    // TO DO:

    // Get an empty/default MapLocation object
    const mapLocation = {};

    // Add location reference:
    mapLocation.location = data.guid || data.document.guid;
    mapLocation.map = map.guid || map.document.guid;

    await writeMapLocation({ accountId, document: mapLocation });
  }

  render() {
    const { accountId } = this.props;
    //
    return (
      <>
        <h2>File Upload</h2>

        <hr />

        <h2>Define locations manually</h2>

        {/* Column 1 */}
        <JsonSchemaForm
          accountId={accountId}
          guid={false}
          schema={LOCATION_JSON_SCHEMA}
          uiSchema={LOCATION_UI_SCHEMA}
          defaultValues={false}
          getDocument={getLocation}
          writeDocument={writeLocation}
          onWrite={this.onWrite}
        />

        {/* Column 2 */}
        <EmptyState
          heading="Location List"
          description="List locations and provide delete functionality"
          callToAction={false}
        />
      </>
    );
  }
}
