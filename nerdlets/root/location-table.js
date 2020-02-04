/*
 * Copyright 2019 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import BootstrapTable from 'react-bootstrap-table-next';
import geoopsConfig from '../../geoopsConfig';
import { Icon } from 'nr1';
import { sortCaret } from './utils';
import moment from 'moment';

export default class LocationTable extends Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
    configId: PropTypes.any.isRequired,
    callbacks: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    //console.debug(props);
    this.statusColFormatter = this.statusColFormatter.bind(this);
    this.favoriteColFormatter = this.favoriteColFormatter.bind(this);
    this.formatIncidentDate = this.formatIncidentDate.bind(this);
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

  tableColumns() {
    const { configId } = this.props;
    //we need the labels object in the config to assign column headers
    const config = geoopsConfig.find(c => c.id == configId);

    const tableColumns = [
      {
        dataField: 'status.color',
        text: '',
        sort: true,
        formatter: this.statusColFormatter,
        classes: 'noTitle statusCol',
        sortCaret: sortCaret,
      },
      {
        dataField: 'favorite',
        text: '',
        formatter: this.favoriteColFormatter,
        classes: 'noTitle favoriteCol',
        sort: true,
        sortCaret: sortCaret,
        events: {
          onClick: (e, column, columnIndex, row, rowIndex) => {
            this.props.callbacks.setFavorite(row.id);
          },
        },
      },
      {
        dataField: 'locationName',
        text: config.labels.locationName,
        sort: true,
        sortCaret: sortCaret,
        events: {
          onClick: (e, column, columnIndex, row, rowIndex) => {
            this.props.callbacks.onClick(row);
          },
        },
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
              this.props.callbacks.onClick(row);
            }
          },
        },
      },
      {
        dataField: 'region',
        text: config.labels.region,
        sort: true,
        classes: 'stateCol',
        sortCaret: sortCaret,
        events: {
          onClick: (e, column, columnIndex, row, rowIndex) => {
            this.props.callbacks.onClick(row);
          },
        },
      },
    ];
    return tableColumns;
  }

  statusColFormatter(cell, row) {
    if (row.status.color === 'darkred') {
      return <span className="statusCell darkred" />;
    } else if (row.status.color === 'red') {
      return <span className="statusCell red" />;
    } else if (row.status.color === 'yellow') {
      return <span className="statusCell yellow" />;
    } else if (row.status.color === 'green') {
      return <span className="statusCell green" />;
    }

    return <span className="statusCell " />;
  }

  favoriteColFormatter(cell, row) {
    //eslint-disable-line
    //console.debug(row);
    if (row.favorite) {
      return (
        <Icon
          type="profiles_events_favorite_weight-bold"
          className="favoriteIcon active"
        />
      );
    } else {
      return (
        <Icon
          type="profiles_events_favorite"
          color="rgba(0,0,0, .3)"
          className="favoriteIcon"
        />
      );
    }
  }

  render() {
    const { data } = this.props;
    console.debug(data);
    return (
      <BootstrapTable
        keyField="id"
        headerClasses="header-row"
        data={data.sort((a, b) => {
          if (a.favorite) {
            return -1;
          } else if (b.favorite) {
            return 1;
          }
          return 0;
        })}
        columns={this.tableColumns()}
        classes="locationsTable"
        bordered={false}
        hover
      />
    );
  }
}
