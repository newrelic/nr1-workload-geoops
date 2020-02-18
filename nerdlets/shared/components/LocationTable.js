import React, { Component } from 'react';
import PropTypes from 'prop-types';

import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import { Icon } from 'nr1';

export default class MapLocationTable extends Component {
  static propTypes = {
    locations: PropTypes.array
  };

  statusFormatter() {
    return <div className="status-color-fill" />;
  }

  favoriteFormatter(cell) {
    return (
      <Icon
        type={
          cell
            ? Icon.TYPE.PROFILES__EVENTS__FAVORITE__WEIGHT_BOLD
            : Icon.TYPE.PROFILES__EVENTS__FAVORITE
        }
        color={cell ? '#FFB951' : '#d5d7d7'}
      />
    );
  }

  render() {
    const { SearchBar } = Search;

    const { locations } = this.props;

    // TO DO [performance] - Rework data flow so that we only have to do this mapping when we load data
    const data = locations.map(l => l.document);

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
        dataField: 'lat',
        text: 'Latitude',
        sort: true
      },
      {
        dataField: 'lng',
        text: 'Longitude',
        sort: true
      },
      {
        dataField: 'municipality',
        text: 'Municipality',
        sort: true
      },
      {
        dataField: 'region',
        text: 'Region',
        sort: true
      },
      {
        dataField: 'country',
        text: 'Country',
        sort: true
      },
      {
        dataField: 'postalCode',
        text: 'Postal Code',
        sort: true
      }
    ];

    return (
      <ToolkitProvider keyField="guid" data={data} columns={columns} search>
        {props => (
          <div className="location-table">
            <SearchBar {...props.searchProps} />
            <BootstrapTable {...props.baseProps} bordered={false} />
          </div>
        )}
      </ToolkitProvider>
    );
  }
}
