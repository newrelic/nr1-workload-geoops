import React, { Component } from "react";
import PropTypes from "prop-types";
import geoopsConfig from "../../geoopsConfig";
import LocationTable from "./location-table";
import { Grid, GridItem, Spinner, Modal, Button } from "nr1";
import PoSMap from './pos-map';
import Data from './data';
import DetailModal from './detail-modal';

export default class GeoOpsNerdlet extends Component {
  static propTypes = {
    launcherUrlState: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      configId: geoopsConfig[0].id,
      data: null,
      hidden: true,
      location: null
    };
    this.callbacks = {
      onClick: this.onClick.bind(this),
      setData: this.setData.bind(this),
      setFavorite: this.setFavorite.bind(this),
      closeModal: this.closeModal.bind(this)
    }
    this.dataProcess = new Data({ demoMode: true, configId: this.state.configId, refreshTimeout: 60000, callbacks: this.callbacks});
  }

  closeModal() {
    this.setState({ hidden: true, location: null });
  }

  setFavorite(id) {
    const { data } = this.state;
    const location = data.find(l => l.id == id);
    location.favorite = !location.favorite;
    //console.debug(`Setting location ${id} to a favorite status of ${location.favorite}`)
    this.setState({ data: data });
  }

  setData(data) {
    //console.debug("Setting data", data);
    this.setState({data});
  }

  onClick(location) {
    this.setState({ location, hidden: false });
  }

  render() {
    const { configId, data, hidden, location } = this.state;
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
            {location && <DetailModal {...this.state} callbacks={this.callbacks} launcherUrlState={this.props.launcherUrlState} />}
          </GridItem>
        </Grid>
    );
  } //render
}
