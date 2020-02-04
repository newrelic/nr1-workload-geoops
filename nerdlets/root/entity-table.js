/*
 * Copyright 2019 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import BootstrapTable from 'react-bootstrap-table-next';
import geoopsConfig from '../../geoopsConfig';
import { navigation } from 'nr1';
import { sortCaret } from './utils';
import moment from 'moment';

export default class EntityTable extends Component {
  static propTypes = {
    entities: PropTypes.array.isRequired,
    configId: PropTypes.any.isRequired,
    callbacks: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.statusColFormatter = this.statusColFormatter.bind(this);
    this.formatIncidentDate = this.formatIncidentDate.bind(this);
    this.formatEntityName = this.formatEntityName.bind(this);
  }

  formatIncidentDate(cell, row) {
    if (row.lastIncidentTimestamp <= 0) {
      return 'N/A';
    } else {
      return moment(row.lastIncidentTimestamp)
        .startOf('day')
        .fromNow();
    }
  }

  formatEntityName(cell, row) {
    return `${row.name} [${row.domain}:${row.type}]`;
  }

  _openEntity(row) {
    const { guid, domain, type } = row;
    console.debug({ entityGuid: guid, domain, type });
    navigation.openStackedEntity(guid);
  }

  tableColumns() {
    const { configId } = this.props;
    // we need the labels object in the config to assign column headers
    const config = geoopsConfig.find(c => c.id == configId);

    const tableColumns = [
      {
        dataField: 'status.color',
        text: '',
        sort: true,
        formatter: this.statusColFormatter,
        classes: 'noTitle statusCol',
        sortCaret: sortCaret,
        events: {
          onClick: (e, column, columnIndex, row, rowIndex) => {
            this._openEntity(row);
          }
        }
      },
      {
        dataField: 'name',
        text: config.labels.entityName,
        formatter: this.formatEntityName,
        sort: true,
        sortCaret: sortCaret,
        events: {
          onClick: (e, column, columnIndex, row, rowIndex) => {
            this._openEntity(row);
          }
        }
      },
      {
        dataField: 'lastIncidentTimestamp',
        formatter: this.formatIncidentDate,
        text: config.labels.lastIncident,
        sort: true,
        sortCaret: sortCaret,
        events: {
          onClick: (e, column, columnIndex, row, rowIndex) => {
            if (row.lastIncident && row.lastIncident.violationUrl) {
              window.open(row.lastIncident.violationUrl);
            } else {
              this._openEntity(row);
            }
          }
        }
      }
    ];
    return tableColumns;
  }

  statusColFormatter(cell, row) {
    const { alertSeverity } = row;
    if (alertSeverity === 'CRITICAL') {
      return <span className="statusCell red" />;
    } else if (alertSeverity === 'WARNING') {
      return <span className="statusCell yellow" />;
    } else if (alertSeverity === 'NOT_ALERTING') {
      return <span className="statusCell green" />;
    }

    return <span className="statusCell " />;
  }

  render() {
    const { entities } = this.props;
    console.debug(entities);
    return (
      <BootstrapTable
        keyField="guid"
        headerClasses="header-row"
        data={entities.sort((a, b) => {
          if (a.alertSeverity == 'CRITICAL') {
            return -1;
          } else if (b.alertSeverity == 'CRITICAL') {
            return 1;
          } else if (a.alertSeverity == 'WARNING') {
            return -1;
          } else if (b.alertSeverity == 'WARNING') {
            return 1;
          }
          return 0;
        })}
        columns={this.tableColumns()}
        classes="entityTable"
        bordered={false}
        hover
      />
    );
  }
}
