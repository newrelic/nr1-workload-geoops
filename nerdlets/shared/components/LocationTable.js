import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import { Icon } from 'nr1';

const StatusColor = styled.div`
  width: 8px;
  height: calc(100% + 1px);

  .status-ok & {
    background-color: #11a600;
  }

  .status-warning & {
    background-color: #ffd966;
  }

  .status-critical & {
    background-color: #bf0016;
  }

  .status-not-reporting & {
    background-color: #8e9494;
  }
`;

export default class MapLocationTable extends Component {
  static propTypes = {
    mapLocations: PropTypes.array
  };

  statusFormatter() {
    return <StatusColor />;
  }

  favoriteFormatter(cell) {
    return (
      <div className="favorite-button">
        <Icon
          type={
            cell
              ? Icon.TYPE.PROFILES__EVENTS__FAVORITE__WEIGHT_BOLD
              : Icon.TYPE.PROFILES__EVENTS__FAVORITE
          }
          color={cell ? '#FFB951' : '#d5d7d7'}
        />
      </div>
    );
  }

  getColumns() {
    return [
      {
        dataField: 'document.guid',
        text: 'GUID',
        sort: true
      },
      {
        dataField: 'document.title',
        text: 'Title',
        sort: true
      },
      {
        dataField: 'document.location.lat',
        text: 'Latitude',
        sort: true
      },
      {
        dataField: 'document.location.lng',
        text: 'Longitude',
        sort: true
      },
      {
        dataField: 'document.location.municipality',
        text: 'Municipality',
        sort: true
      },
      {
        dataField: 'document.location.region',
        text: 'Region',
        sort: true
      },
      {
        dataField: 'document.location.country',
        text: 'Country',
        sort: true
      },
      {
        dataField: 'document.location.postalCode',
        text: 'Postal Code',
        sort: true
      }
    ];
  }

  render() {
    const { SearchBar } = Search;
    const { mapLocations: data } = this.props;
    const columns = this.getColumns();

    const hasData = data.length > 0;

    return (
      <>
        {hasData && (
          <ToolkitProvider
            keyField="document.guid"
            data={data}
            columns={columns}
            search
          >
            {props => (
              <div className="location-table">
                <SearchBar {...props.searchProps} />
                <BootstrapTable {...props.baseProps} bordered={false} />
              </div>
            )}
          </ToolkitProvider>
        )}
      </>
    );
  }
}
