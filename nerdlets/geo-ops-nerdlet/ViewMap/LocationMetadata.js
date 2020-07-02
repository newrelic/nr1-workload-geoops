import React from 'react';
import PropTypes from 'prop-types';
import { Stack, StackItem } from 'nr1';

const LocationMetadata = ({ activeMapLocation }) => {
  const keys = Object.keys(activeMapLocation);

  const items = keys.map(key => {
    if (typeof activeMapLocation[key] !== 'object') {
      return (
        <li key={key} className="detail-panel-metadata-item">
          <Stack fullWidth>
            <StackItem className="detail-panel-metadata-item-key" title={key}>
              {key}
            </StackItem>
            <StackItem
              grow
              className="detail-panel-metadata-item-value"
              title={activeMapLocation[key]}
            >
              {activeMapLocation[key]}
            </StackItem>
          </Stack>
        </li>
      );
    } else if (key === 'location') {
      const locationKeys = Object.keys(activeMapLocation[key]);

      return locationKeys.map(locationKey => {
        return (
          <li key={locationKey} className="detail-panel-metadata-item">
            <Stack fullWidth>
              <StackItem
                className="detail-panel-metadata-item-key"
                title={locationKey}
              >
                {locationKey}
              </StackItem>
              <StackItem
                grow
                className="detail-panel-metadata-item-value"
                title={activeMapLocation[key][locationKey]}
              >
                {activeMapLocation[key][locationKey]}
              </StackItem>
            </Stack>
          </li>
        );
      });
    } else {
      return '';
    }
  });

  return <ul className="detail-panel-metadata-list">{items}</ul>;
};

LocationMetadata.propTypes = {
  activeMapLocation: PropTypes.object
};

export default LocationMetadata;
