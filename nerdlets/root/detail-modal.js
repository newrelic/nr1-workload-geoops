import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, LineChart, HeadingText, Button, StackItem, Stack } from 'nr1';
import EntityTable from './entity-table';
import geoopsConfig from "../../geoopsConfig";
import moment from 'moment';

export default class DetailModal extends Component {
  static propTypes = {
    configId: PropTypes.any.isRequired,
    data: PropTypes.array.isRequired,
    hidden: PropTypes.bool.isRequired,
    location: PropTypes.object.isRequired,
    callbacks: PropTypes.object.isRequired,
    launcherUrlState: PropTypes.object.isRequired
  }

  render() {
    const { configId, location, hidden, callbacks } = this.props;
    const config = geoopsConfig.find(c => c.id == configId);
    const entityGuidsForNrql = location.entities.map(entity => `"${entity.guid}"`);
    const { duration } = this.props.launcherUrlState.timeRange;
    const durationInMinutes = duration/1000/60;
    const { accountId } = config.entities.joins.INFRA.nrql;
    return (
      <Modal hidden={hidden} onClose={() => { callbacks.closeModal(); }}>
        <Stack
          directionType={Stack.DIRECTION_TYPE.VERTICAL}
          gapType={Stack.GAP_TYPE.TIGHT}>
          <StackItem>
            <div className="storeStatus" style={{ backgroundColor: location.status.color}}></div>
            <div className="infoPanelHeaderPrimaryInfo">
                <h4 className="infoPanelStoreId">Store: {location.locationId}</h4>
                <span className="infoPanelLocation">{config.labels.addrss}: {location.municipatility}, {location.region}</span>
            </div>
            <Button className="infoPanelMinimizeButton" sizeType={Button.SIZE_TYPE.SLIM} iconType={Button.ICON_TYPE.INTERFACE__CHEVRON__CHEVRON_RIGHT} onClick={() => {callbacks.closeModal(); }}/>
          </StackItem>
          <StackItem>
            <EntityTable
              entities={location.entities}
              configId={configId}
              callbacks={callbacks}
            />
          </StackItem>
        </Stack>
      </Modal>
    );
  }
}
/*
          <StackItem>
            <HeadingText>CPU since {moment(duration).fromNow()}</HeadingText>
            <LineChart
              accountId={accountId}
              query={`FROM SystemSample SELECT average( cpuPercent ) as 'percentCpu' WHERE entityGuid in ${entityGuidsForNrql} FACET entityGuid, hostname TIMESERIES SINCE ${durationInMinutes} MINUTES AGO`}
            />
          </StackItem>

*/