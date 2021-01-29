import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown, DropdownItem } from 'nr1';
import { groupBy } from 'lodash';

import { ToolbarItem } from '../../components';
import { StyledToolbarItem } from './styles';

const LeftToolbar = ({
  map,
  mapLocations,
  onFilter,
  regionFilter,
  favoriteFilter,
  alertFilter
}) => {
  const regions = Object.keys(
    groupBy(mapLocations, i => (i.location ? i.location.region : null))
  );

  const favoriteOptions = [
    { name: 'All', value: null },
    { name: 'Favorites', value: true },
    { name: 'Unfavorited', value: false }
  ];

  const selectedFavorite = favoriteOptions.find(
    o => o.value === favoriteFilter
  );

  const alertStatusOptions = [
    { name: 'All', value: null },
    { name: 'CRITICAL', value: 'CRITICAL' },
    { name: 'NOT_ALERTING', value: 'NOT_ALERTING' },
    { name: 'NOT_CONFIGURED', value: 'NOT_CONFIGURED' },
    { name: 'WARNING', value: 'WARNING' }
  ];

  const selectedAlertStatus = alertStatusOptions.find(
    o => o.value === alertFilter
  );

  return (
    <>
      <StyledToolbarItem hasSeparator>
        <span>Current Map</span>
        <h4>{map.title}</h4>
      </StyledToolbarItem>
      <ToolbarItem>
        <Dropdown title={regionFilter || 'Filter by Region'}>
          <DropdownItem
            key={0}
            onClick={() => {
              onFilter({
                filter: { name: 'regionFilter', value: null }
              });
            }}
          >
            All
          </DropdownItem>
          {regions.map(r => {
            return (
              <DropdownItem
                key={r}
                onClick={() => {
                  onFilter({
                    filter: { name: 'regionFilter', value: r }
                  });
                }}
              >
                {r}
              </DropdownItem>
            );
          })}
        </Dropdown>
      </ToolbarItem>
      <ToolbarItem>
        <Dropdown title={selectedFavorite.name || 'Favorites'}>
          {favoriteOptions.map(r => {
            return (
              <DropdownItem
                key={r.value}
                onClick={() => {
                  onFilter({
                    filter: { name: 'favoriteFilter', value: r.value }
                  });
                }}
              >
                {r.name}
              </DropdownItem>
            );
          })}
        </Dropdown>
      </ToolbarItem>
      <ToolbarItem>
        <Dropdown title={selectedAlertStatus.name || 'Alerting Status'}>
          {alertStatusOptions.map(r => {
            return (
              <DropdownItem
                key={r.value}
                onClick={() => {
                  onFilter({
                    filter: { name: 'alertFilter', value: r.value }
                  });
                }}
              >
                {r.name}
              </DropdownItem>
            );
          })}
        </Dropdown>
      </ToolbarItem>
    </>
  );
};

LeftToolbar.propTypes = {
  map: PropTypes.object,
  mapLocations: PropTypes.array,
  onFilter: PropTypes.func,
  regionFilter: PropTypes.string,
  favoriteFilter: PropTypes.bool,
  alertFilter: PropTypes.string
};

export default LeftToolbar;
