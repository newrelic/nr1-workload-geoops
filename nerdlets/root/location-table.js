import React, { Component } from "react";
import PropTypes from "prop-types";
import BootstrapTable from "react-bootstrap-table-next";
import geoopsConfig from "../../geoopsConfig";
import { ChevronUp, ChevronDown } from "react-feather";
import { Icon } from "nr1";
import moment from 'moment';

const noOrderCarets = (
  <div className="caretsContainer">
    <ChevronUp color="rgba(0,0,0, .3)" size={12} />
    <ChevronDown color="rgba(0,0,0, .3)" size={12} />
  </div>
);

const ascCaret = (
  <div className="caretsContainer sorted">
    <ChevronUp color="rgba(0,0,0, .8)" size={12} />
  </div>
);

const descCaret = (
  <div className="caretsContainer sorted">
    <ChevronDown color="rgba(0,0,0, .8)" size={12} />
  </div>
);

const sortCaret = (order /*, column*/) => {
  if (!order) {
    return noOrderCarets;
  } else if (order === "asc") {
    return ascCaret;
  } else if (order === "desc") {
    return descCaret;
  }
  return null;
};

export default class LocationTable extends Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
    configId: PropTypes.any.isRequired,
    callbacks: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.statusColFormatter = this.statusColFormatter.bind(this);
    this.favoriteColFormatter = this.favoriteColFormatter.bind(this);
    this.formatIncidentDate = this.formatIncidentDate.bind(this);
  }

  formatIncidentDate(cell, row) {
    if (row.lastIncidentTimestamp <= 0) {
      return "N/A";
    } else {
      return moment(row.lastIncidentTimestamp).startOf("day").fromNow();
    }
  }

  tableColumns() {
    const { configId } = this.props;
    //we need the labels object in the config to assign column headers
    const config = geoopsConfig.find(c => c.id == configId);

    const tableColumns = [
      {
        dataField: "status.color",
        text: "",
        sort: true,
        formatter: this.statusColFormatter,
        classes: "noTitle statusCol",
        sortCaret: sortCaret
      },
      {
        dataField: "favorite",
        text: "",
        formatter: this.favoriteColFormatter,
        classes: "noTitle favoriteCol",
        sort: true,
        sortCaret: sortCaret,
        events: {
          onClick: (e, column, columnIndex, row, rowIndex) => {
            this.props.callbacks.setFavorite(row.id);
          },
        }
      },
      {
        dataField: "locationName",
        text: config.labels.locationName,
        sort: true,
        sortCaret: sortCaret,
        events: {
          onClick: (e, column, columnIndex, row, rowIndex) => {
            this.props.callbacks.onClick(row);
          },
        }
      },
      {
        dataField: "lastIncidentTimestamp",
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
        }
      },
      {
        dataField: "region",
        text: config.labels.region,
        sort: true,
        classes: "stateCol",
        sortCaret: sortCaret,
        events: {
          onClick: (e, column, columnIndex, row, rowIndex) => {
            this.props.callbacks.onClick(row);
          },
        }
      }
    ];
    return tableColumns;
  }

  statusColFormatter(cell, row) {
    if (row.status.color === "red") {
      return <span className="statusCell red" />;
    } else if (row.status.color === "yellow") {
      return <span className="statusCell yellow" />;
    } else if (row.status.color === "green") {
      return <span className="statusCell green" />;
    }

    return <span className="statusCell " />;
  }

  favoriteColFormatter(cell, row) {
    //eslint-disable-line
    console.debug(row);
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
    return (
      <BootstrapTable
        keyField="id"
        headerClasses="header-row"
        data={data}
        columns={this.tableColumns()}
        classes="locationsTable"
        bordered={false}
        hover
      />
    );
  }
}
