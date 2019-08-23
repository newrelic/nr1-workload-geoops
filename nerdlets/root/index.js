import React, { Component } from "react";
import PropTypes from "prop-types";
import geoopsConfig from "../../geoopsConfig";
import LocationTable from "./location-table";
import { Grid, GridItem, Spinner, navigation } from "nr1";
import PoSMap from './pos-map';
import Data from './data';

export default class GeoOpsNerdlet extends Component {
  static propTypes = {
    launcherUrlState: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      configId: geoopsConfig[0].id,
      data: null
    };
    this.callbacks = {
      onClick: this.onClick.bind(this),
      setData: this.setData.bind(this),
      setFavorite: this.setFavorite.bind(this)
    }
    this.dataProcess = new Data({ demoMode: true, configId: this.state.configId, refreshTimeout: 60000, callbacks: this.callbacks});
  }

  setFavorite(id) {
    const { data } = this.state;
    const location = data.find(l => l.id == id);
    location.favorite = !location.favorite;
    console.debug(`Setting location ${id} to a favorite status of ${location.favorite}`)
    this.setState({ data: data });
  }

  setData(data) {
    //console.debug("Setting data", data);
    this.setState({data});
  }

  onClick(point) {
    const { configId } = this.state;
    const config = geoopsConfig.find(c => c.id == configId);
    switch (config.detailWindow) {
      case "overlay":
        navigation.openOverlay({
          id: "52a251e1-8797-4570-bc65-3c5999778dc9.details-overlay",
          urlState: { configId, locationId: point.locationId }
        });
        break;
    }
  }

  render() {
    const { configId, data } = this.state;
    if (!data) {
        return <div className="geoOpsContainer">
            <Spinner fillContainer />
        </div>
    }

    return (
        <Grid className="primary-grid">
          <GridItem columnSpan={3} className="gridItem">
            <LocationTable
              configId={configId}
              callbacks={this.callbacks}
              data={data}
            />
          </GridItem>
          <GridItem
            columnSpan={9}
            collapseGapBefore={true}
            collapseGapAfter={true}
            className="gridItem">
            <PoSMap
              configId={configId}
              callbacks={this.callbacks}
              data={data}
            />
          </GridItem>
        </Grid>
    );
  } //render
}
