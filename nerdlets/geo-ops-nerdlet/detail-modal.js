/*
 * Copyright 2019 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  LineChart,
  TableChart,
  HeadingText,
  BlockText,
  Tabs,
  TabsItem
} from 'nr1';
import EntityTable from './entity-table';
import geoopsConfig from '../../geoopsConfig';
import moment from 'moment';

export default class DetailModal extends Component {
  static propTypes = {
    configId: PropTypes.string.isRequired,
    hidden: PropTypes.bool.isRequired,
    location: PropTypes.object.isRequired,
    callbacks: PropTypes.object.isRequired,
    launcherUrlState: PropTypes.object.isRequired
  };

  render() {
    const { configId, location, hidden, callbacks } = this.props;
    const config = geoopsConfig.find(c => c.id === configId);
    const infraGuidsForNrql = location.entities
      .filter(e => e.domain === 'INFRA')
      .map(entity => `'${entity.guid}'`);
    const apmGuidsForNrql = location.entities
      .filter(e => e.domain === 'APM')
      .map(entity => `'${entity.guid}'`);
    const { duration } = this.props.launcherUrlState.timeRange;
    const since = moment()
      .subtract(duration)
      .fromNow();
    const durationInMinutes = duration / 1000 / 60;
    const { accountId } = config.entities.joins.INFRA.nrql;
    // eslint-disable-next-line no-console
    console.debug([infraGuidsForNrql, apmGuidsForNrql]);
    return (
      <Modal
        className="entityModal"
        hidden={hidden}
        onClose={() => {
          callbacks.closeModal();
        }}
        style={{ padding: '0 !important' }}
      >
        <div className="modalContainer">
          <div className="headingContainer">
            <div
              className="storeStatus"
              style={{ backgroundColor: location.status.color }}
            />
            <div className="infoPanelHeaderPrimaryInfo">
              <h4 className="infoPanelStoreId">Store: {location.locationId}</h4>
              <span className="infoPanelLocation">
                {config.labels.address}: {location.municipatility},{' '}
                {location.region}
              </span>
            </div>
          </div>
          <div className="entityTableContainer">
            <EntityTable
              entities={location.entities}
              configId={configId}
              callbacks={callbacks}
            />
          </div>
          <div className="entityTabsContainer">
            <Tabs defaultValue={0}>
              <TabsItem label="Devices" value={0}>
                <HeadingText type={HeadingText.TYPE.HEADING4}>
                  CPU utilization
                </HeadingText>
                <BlockText>since {since}</BlockText>
                <LineChart
                  accountId={accountId}
                  query={`FROM SystemSample SELECT average( cpuPercent ) as 'percentCpu' WHERE entityGuid in (${infraGuidsForNrql}) FACET entityGuid, hostname TIMESERIES SINCE ${durationInMinutes} MINUTES AGO`}
                  className="chart"
                />
                <HeadingText type={HeadingText.TYPE.HEADING4}>
                  Memory utilization
                </HeadingText>
                <BlockText>since {since}</BlockText>
                <LineChart
                  accountId={accountId}
                  query={`FROM SystemSample SELECT average(memoryUsedBytes/memoryTotalBytes)*100 as 'percentMemory' WHERE entityGuid in (${infraGuidsForNrql}) FACET entityGuid, hostname TIMESERIES SINCE ${durationInMinutes} MINUTES AGO`}
                  className="chart"
                />
                <HeadingText type={HeadingText.TYPE.HEADING4}>
                  Disk utilization
                </HeadingText>
                <BlockText>since {since}</BlockText>
                <LineChart
                  accountId={accountId}
                  query={`FROM SystemSample SELECT average( diskUsedPercent ) as 'percentDisk' WHERE entityGuid in (${infraGuidsForNrql}) FACET entityGuid, hostname TIMESERIES SINCE ${durationInMinutes} MINUTES AGO`}
                  className="chart"
                />
              </TabsItem>
              {apmGuidsForNrql && apmGuidsForNrql.length > 0 && (
                <TabsItem label="Apps" value={1}>
                  <HeadingText type={HeadingText.TYPE.HEADING4}>
                    Transaction count
                  </HeadingText>
                  <BlockText>since {since}</BlockText>
                  <LineChart
                    accountId={accountId}
                    query={`FROM Transaction SELECT count(*) as 'Transactions' WHERE entityGuid in (${apmGuidsForNrql}) FACET entityGuid, appName TIMESERIES SINCE ${durationInMinutes} MINUTES AGO`}
                    className="chart"
                  />
                  <BlockText>Transaction breakdown</BlockText>
                  <TableChart
                    accountId={accountId}
                    query={`FROM Transaction SELECT count(*) as 'Transactions' WHERE entityGuid in (${apmGuidsForNrql}) FACET name, entityGuid SINCE ${durationInMinutes} MINUTES AGO`}
                    className="chart"
                  />
                  <HeadingText type={HeadingText.TYPE.HEADING4}>
                    Error rate
                  </HeadingText>
                  <BlockText>since {since}</BlockText>
                  <LineChart
                    accountId={accountId}
                    query={`FROM Transaction SELECT percentage(count(*), WHERE error is true) as 'Error Rate' WHERE entityGuid in (${apmGuidsForNrql}) FACET entityGuid, appName TIMESERIES SINCE ${durationInMinutes} MINUTES AGO`}
                    className="chart"
                  />
                  <HeadingText type={HeadingText.TYPE.HEADING4}>
                    Error details
                  </HeadingText>
                  <BlockText>since {since}</BlockText>
                  <TableChart
                    accountId={accountId}
                    query={`FROM Transaction SELECT percentage(count(*), WHERE error is true) as 'Error Rate' WHERE entityGuid in (${apmGuidsForNrql}) FACET entityGuid SINCE ${durationInMinutes} MINUTES AGO`}
                    className="chart"
                  />
                </TabsItem>
              )}
            </Tabs>
          </div>
        </div>
      </Modal>
    );
  }
}
