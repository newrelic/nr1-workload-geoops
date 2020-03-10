import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import { Icon, AccountStorageMutation, AccountStorageQuery } from 'nr1';

export default class MapLocationTable extends PureComponent {
  static propTypes = {
    map: PropTypes.object,
    data: PropTypes.array
  };

  constructor(props) {
    super(props);
    this.state = {
      favoriteLocations: []
    };

    this.getFavoriteLocations = this.getFavoriteLocations.bind(this);
    this.handleFavoriteClick = this.handleFavoriteClick.bind(this);
    this.favoriteFormatter = this.favoriteFormatter.bind(this);
  }

  componentDidMount() {
    this.getFavoriteLocations();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.map !== this.props.map) {
      this.getFavoriteLocations();
    }
  }

  statusFormatter() {
    return <div className="status-color-fill" />;
  }

  favoriteFormatter(cell, row, rowIndex) {
    const { favoriteLocations } = this.state;
    if (favoriteLocations && favoriteLocations[row.externalId]) {
      return (
        <Icon
          type={Icon.TYPE.PROFILES__EVENTS__FAVORITE__WEIGHT_BOLD}
          color={favoriteLocations[row.externalId] ? '#FFB951' : '#d5d7d7'}
        />
      );
    } else {
      return (
        <Icon type={Icon.TYPE.PROFILES__EVENTS__FAVORITE} color="#d5d7d7" />
      );
    }
  }

  getFavoriteLocations() {
    const { accountId, guid } = this.props.map;

    AccountStorageQuery.query({
      accountId: accountId,
      collection: 'workloadsGeoopsFavorites',
      documentId: guid
    }).then(({ data }) => {
      this.setState({ favoriteLocations: data });
    });
  }

  handleFavoriteClick(e, column, row) {
    const { accountId, guid } = this.props.map;

    AccountStorageQuery.query({
      accountId: accountId,
      collection: 'workloadsGeoopsFavorites',
      documentId: guid
    }).then(({ data }) => {
      const document = {
        ...data,
        [row.externalId]: !data[row.externalId]
      };
      this.setState({ favoriteLocations: document });
      AccountStorageMutation.mutate({
        accountId: accountId,
        actionType: AccountStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
        collection: 'workloadsGeoopsFavorites',
        documentId: guid,
        document: document
      });
    });
  }

  dummyData() {
    return [
      {
        status: 'critical',
        favorite: true,
        id: 2439,
        lastIncident: '2/4/20 10:54 AM',
        region: 'CAN'
      },
      {
        status: 'critical',
        favorite: true,
        id: 654,
        lastIncident: '2/4/20 10:54 AM',
        region: 'CAN'
      },
      {
        status: 'warning',
        favorite: false,
        id: 2435467,
        lastIncident: '2/4/20 10:54 AM',
        region: 'CAN'
      },
      {
        status: 'noAlert',
        favorite: false,
        id: 9876,
        lastIncident: '2/4/20 10:54 AM',
        region: 'CAN'
      },
      {
        status: 'noAlert',
        favorite: false,
        id: '6354',
        lastIncident: '2/4/20 10:54 AM',
        region: 'CAN'
      }
    ];
  }

  columns() {
    return [
      {
        dataField: 'mostCriticalEntity.alertSeverity',
        text: '',
        sort: true,
        classes: cell => {
          if (cell === 'NOT_ALERTING') {
            return 'status-ok';
          } else if (cell === 'WARNING') {
            return 'status-warning';
          } else if (cell === 'CRITICAL') {
            return 'status-critical';
          } else if (cell === 'NOT_CONFIGURED') {
            return 'status-not-reporting';
          }
        },
        formatter: this.statusFormatter
      },
      {
        dataField: 'favorite',
        text: '',
        sort: true,
        formatter: this.favoriteFormatter,
        events: {
          onClick: (e, column, columnIndex, row, rowIndex) => {
            this.handleFavoriteClick(e, column, row);
          }
        }
      },
      {
        dataField: 'externalId',
        text: 'ExID',
        sort: true
      },
      {
        dataField: 'lastIncidentTime',
        text: 'Last Incident',
        sort: true
      },
      {
        dataField: 'location.region',
        text: 'Region',
        sort: true
      }
    ];
  }

  render() {
    const { SearchBar } = Search;
    const { data } = this.props;

    return (
      <ToolkitProvider
        keyField="externalId"
        data={data}
        columns={this.columns()}
        search
      >
        {props => (
          <div>
            <SearchBar {...props.searchProps} />
            <BootstrapTable {...props.baseProps} bordered={false} />
          </div>
        )}
      </ToolkitProvider>
    );
  }
}
