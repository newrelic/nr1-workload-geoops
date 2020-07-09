import React from 'react';
import PropTypes from 'prop-types';
import { Stack } from 'nr1';

import {
  MetadataItemContainer,
  MetadataItemKey,
  MetadataItemValue
} from './styles';

const LocationMetadata = ({ activeMapLocation }) => {
  if (!activeMapLocation) return '';

  const keys = Object.keys(activeMapLocation);

  const items = keys.map(key => {
    if (typeof activeMapLocation[key] !== 'object') {
      return (
        <MetadataItemContainer key={key}>
          <Stack fullWidth>
            <MetadataItemKey title={key}>{key}</MetadataItemKey>
            <MetadataItemValue grow title={activeMapLocation[key]}>
              {activeMapLocation[key]}
            </MetadataItemValue>
          </Stack>
        </MetadataItemContainer>
      );
    } else if (key === 'location') {
      const locationKeys = Object.keys(activeMapLocation[key]);

      return locationKeys.map(locationKey => {
        return (
          <MetadataItemContainer key={locationKey}>
            <Stack fullWidth>
              <MetadataItemKey title={locationKey}>
                {locationKey}
              </MetadataItemKey>
              <MetadataItemValue
                grow
                title={activeMapLocation[key][locationKey]}
              >
                {activeMapLocation[key][locationKey]}
              </MetadataItemValue>
            </Stack>
          </MetadataItemContainer>
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
