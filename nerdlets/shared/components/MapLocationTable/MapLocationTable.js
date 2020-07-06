import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import { Icon, Link } from 'nr1';

import { StatusColor } from './styles';

export default class MapLocationTable extends PureComponent {
  static propTypes = {
    map: PropTypes.object,
    data: PropTypes.array,
    favoriteLocations: PropTypes.object,
    rowClickHandler: PropTypes.func,
    favoriteClickHandler: PropTypes.func,
    activeMapLocation: PropTypes.object
  };

  statusFormatter() {
    return <StatusColor />;
  }

  favoriteSortValue = (cell, row) => {
    const { favoriteLocations } = this.props;

    return (favoriteLocations && favoriteLocations[row.externalId]) || false;
  };

  favoriteFormatter = (cell, row) => {
    const { favoriteLocations } = this.props;

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
  };

  rowClasses(row) {
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
        sortValue: this.favoriteSortValue,
        events: {
          onClick: (e, column, columnIndex, row) => {
            e.preventDefault();
            this.props.favoriteClickHandler(e, column, row);
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
        sort: true,
        formatter: (cell, row) => {
          const { mostCriticalEntity } = row;

          if (!mostCriticalEntity) {
            return null;
          }

          const { alertViolations } = mostCriticalEntity;

          if (!alertViolations) {
            return null;
          }

          const violation = alertViolations.reduce((p, v) => {
            if (!p) return v;
            if (v.openedAt > p.openedAt) return v;

            return p;
          }, false);

          if (alertViolations && violation) {
            return <Link to={violation.agentUrl}>{row.lastIncidentTime}</Link>;
          }

          return row.lastIncidentTime;
        }
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
      onClick: (e, row) => {
        this.props.rowClickHandler(row);
      }
    };
  }

  render() {
    const { SearchBar } = Search;
    const { data } = this.props;

    return (
      <ToolkitProvider
        keyField="guid"
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
  }
}
