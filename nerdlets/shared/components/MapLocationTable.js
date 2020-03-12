import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import { Icon, AccountStorageMutation, AccountStorageQuery } from 'nr1';

export default class MapLocationTable extends PureComponent {
  static propTypes = {
    map: PropTypes.object,
    data: PropTypes.array,
    rowClickHandler: PropTypes.func,
    activeMapLocation: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      favoriteLocations: []
    };

    this.renderOriginalTable = () => {
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
              <BootstrapTable
                {...props.baseProps}
                bordered={false}
                rowEvents={this.rowEvents()}
                rowClasses={(row, rowIndex) => this.rowClasses(row, rowIndex)}
              />
            </div>
          )}
        </ToolkitProvider>
      );
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

    if (prevProps.activeMapLocation !== this.props.activeMapLocation) {
      this.renderTable = () => {
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
                <BootstrapTable
                  {...props.baseProps}
                  bordered={false}
                  rowEvents={this.rowEvents()}
                  rowClasses={this.rowClasses()}
                />
              </div>
            )}
          </ToolkitProvider>
        );
      };
    }
  }

  statusFormatter() {
    return <div className="status-color-fill" />;
  }

  favoriteFormatter(cell, row, rowIndex) {
    const { favoriteLocations } = this.state;

    const favoriteStatus =
      (favoriteLocations && favoriteLocations[row.externalId]) || false;
    return (
      <Icon
        className="favorite-button"
        type={
          favoriteStatus
            ? Icon.TYPE.PROFILES__EVENTS__FAVORITE__WEIGHT_BOLD
            : Icon.TYPE.PROFILES__EVENTS__FAVORITE
        }
        color={favoriteStatus ? '#FFB951' : '#d5d7d7'}
      />
    );
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

  rowClasses(row, rowIndex) {
    let classes = null;

    if (!this.props.activeMapLocation) {
      classes = '';
    } else if (row.guid === this.props.activeMapLocation.guid) {
      classes = 'active-location';
    }

    return classes;
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

  rowEvents() {
    return {
      onClick: (e, row, rowIndex) => {
        this.props.rowClickHandler(row);
      }
    };
  }

  render() {
    const { SearchBar } = Search;
    const { data } = this.props;

    return this.renderOriginalTable();
  }
}
