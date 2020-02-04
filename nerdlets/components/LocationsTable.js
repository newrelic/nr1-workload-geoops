import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';

export default class LocationsTable extends Component {
  statusFormatter(cell) {
    return <div className={'status-color-fill'}></div>;
  }

  render() {
    const { SearchBar } = Search;

    const products = [
      {
        status: 'critical',
        favorite: true,
        id: 2439,
        lastIncident: '2/4/20 10:54 AM',
        region: 'CAN',
      },
      {
        status: 'critical',
        favorite: true,
        id: 654,
        lastIncident: '2/4/20 10:54 AM',
        region: 'CAN',
      },
      {
        status: 'warning',
        favorite: false,
        id: 2435467,
        lastIncident: '2/4/20 10:54 AM',
        region: 'CAN',
      },
      {
        status: 'noAlert',
        favorite: false,
        id: 9876,
        lastIncident: '2/4/20 10:54 AM',
        region: 'CAN',
      },
      {
        status: 'noAlert',
        favorite: false,
        id: '6354',
        lastIncident: '2/4/20 10:54 AM',
        region: 'CAN',
      },
    ];
    const columns = [
      {
        dataField: 'status',
        text: '',
        sort: true,
        classes: cell => {
          if (cell === 'noAlert') {
            return 'status-ok';
          } else if (cell === 'warning') {
            return 'status-warning';
          } else if (cell === 'critical') {
            return 'status-critical';
          }
        },
        formatter: this.statusFormatter,
      },
      {
        dataField: 'favorite',
        text: '',
        sort: true,
      },
      {
        dataField: 'id',
        text: 'Store ID',
        sort: true,
      },
      {
        dataField: 'lastIncident',
        text: 'Last Incident',
        sort: true,
      },
      {
        dataField: 'region',
        text: 'Region',
        sort: true,
      },
    ];

    return (
      <ToolkitProvider keyField="id" data={products} columns={columns} search>
        {props => (
          <div>
            <h3>Input something at below input field:</h3>
            <SearchBar {...props.searchProps} />
            <hr />
            <BootstrapTable {...props.baseProps} />
          </div>
        )}
      </ToolkitProvider>
    );
  }
}
