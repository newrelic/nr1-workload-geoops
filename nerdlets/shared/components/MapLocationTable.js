import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import some from 'lodash.some';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import { Icon, AccountStorageMutation, AccountStorageQuery } from 'nr1';

export default class MapLocationTable extends PureComponent {
  static propTypes = {
    mapLocations: PropTypes.array,
    entities: PropTypes.object,
    entityToEntitiesLookup: PropTypes.object,
    map: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      favoriteLocations: []
    };

    this.getFavoriteLocations = this.getFavoriteLocations.bind(this);
    this.favoriteFormatter = this.favoriteFormatter.bind(this);
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
      collection: 'workloadsGeooopsFavorites',
      documentId: guid
    }).then(({ data }) => {
      this.setState({ favoriteLocations: data });
    });
  }

  handleFavoriteClick(e, column, row) {
    const { accountId, guid } = this.props.map;

    AccountStorageQuery.query({
      accountId: accountId,
      collection: 'workloadsGeooopsFavorites',
      documentId: guid
    }).then(({ data }) => {
      AccountStorageMutation.mutate({
        accountId: accountId,
        actionType: AccountStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
        collection: 'workloadsGeooopsFavorites',
        documentId: guid,
        document: {
          ...data,
          [row.externalId]: true
        }
      });
    });
  }

  transformMapLocations() {
    const { mapLocations = [], entities } = this.props;

    return mapLocations.reduce((previousValue, ml) => {
      const { document } = ml;
      const { externalId = '', location } = document;
      const { region = '' } = location;

      if (!document.guid || !region) {
        console.warn('Map Location missing data: ');
        console.warn(document);
        return previousValue;
      }

      const status = this.calculateStatus(document);
      // const lastIncident = entities.findLastIncident;

      previousValue.push({
        status,
        favorite: false,
        externalId,
        lastIncident: '2/4/20 10:54 AM', // TO DO - does entity outline give us this?
        region
      });

      return previousValue;
    }, []);
  }

  severityStatusToWeight(value) {
    const values = {
      CRITICAL: 1,
      WARNING: 2,
      NOT_ALERTING: 3,
      NOT_CONFIGURED: 4
    };

    return values[value] || 5;
  }

  weightToSeverityStatus(value) {
    const values = {
      1: 'CRITICAL',
      2: 'WARNING',
      3: 'NOT_ALERTING',
      4: 'NOT_CONFIGURED'
    };

    return values[value] || '';
  }

  /*
   * Look for the highest weighted value on all associated entities
   */
  calculateStatus(mapLocation) {
    const { entities, entityToEntitiesLookup } = this.props;
    const mapLocationEntities = mapLocation.entities || [];
    let maxStatus;
    const defaultStatus = 5;

    if (mapLocationEntities.length > 0) {
      // TO DO
      // Does 'some' convert the object to an array first? If so, we should find a more performant way to check for values
      // Maybe we don't pass the mapped entities down and just an array
      // and we let this component build the map
      if (some(mapLocationEntities)) {
        maxStatus = mapLocationEntities.reduce((p, { guid: entityGuid }) => {
          const entity = entities[entityGuid];
          const relatedEntities = entityToEntitiesLookup[entityGuid] || [];

          const entitiesToDistill = [
            entity,
            ...relatedEntities.map(guid => entities[guid])
          ];
          const distill = (previousValue, { guid: entityGuid }) => {
            if (entityGuid) {
              const entity = entities[entityGuid];
              if (entity) {
                const status = entity.alertSeverity || ''; // Only exists on alertable entities
                const current = this.severityStatusToWeight(status);
                if (current < previousValue) {
                  return current;
                }
              }
            }
            return previousValue;
          };

          return entitiesToDistill.reduce(distill, p);
        }, defaultStatus);
      }
    }

    const label = this.weightToSeverityStatus(maxStatus);
    return label;
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
        dataField: 'status',
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
        text: 'ID',
        sort: true
      },
      {
        dataField: 'lastIncident',
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
    const data = this.transformMapLocations();
    this.getFavoriteLocations();

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
