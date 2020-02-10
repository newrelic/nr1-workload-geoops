import React from 'react';
import PropTypes from 'prop-types';
import cloneDeep from 'lodash.clonedeep';

import { writeMapLocation } from '../shared/services/map-location';

export default class MapLocationData extends React.PureComponent {
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
      </>
    );
  }
}
