/* eslint-disable react/prop-types */
import React from 'react';
import PropTypes from 'prop-types';

import get from 'lodash.get';

import {
  Button,
  Icon,
  SparklineChart,
  Stack,
  StackItem,
  navigation,
  Link,
  Tooltip
} from 'nr1';

import { statusColor } from '../utils';

const FeaturedChart = function({ map, mapLocation }) {
  const accountId = map.accountId;
  const baseQuery = get(mapLocation, 'query', '');
  const query = baseQuery ? `${baseQuery} TIMESERIES` : baseQuery;

  return (
    <>
      {/* TO DO - We don't have this data. We built the data fetching into <GeoMap> so it only queries for those points that are visible */}
      {/* We would need to re-excute the query for _this_ MapLocation, or pull up the data fetching out of <GeoMap> */}
      {/* <Stack fullWidth className="detail-panel-featured-chart-header-container">
        <StackItem grow>
          <h6 className="detail-panel-featured-chart-header">
            Revenue overview
          </h6>
        </StackItem>

        <StackItem>
          <span className="detail-panel-featured-chart-comparison-stat negative">
            14.5%
          </span>
        </StackItem>
      </Stack> */}
      {accountId && query && (
        <>
          <Stack
            fullWidth
            className="detail-panel-featured-chart-header-container"
          >
            <StackItem grow>
              <h6 className="detail-panel-featured-chart-header">
                Chart query
              </h6>
            </StackItem>

            <StackItem>
              <Tooltip
                className="detail-panel-featured-chart-query"
                text={query}
                placementType={Tooltip.PLACEMENT_TYPE.LEFT}
              >
                {query}
              </Tooltip>
            </StackItem>
          </Stack>
          <SparklineChart accountId={accountId} query={query} />
        </>
      )}
    </>
  );
};

class Header extends React.PureComponent {
  renderEntityLink(mapLocation) {
    if (!mapLocation || !mapLocation.entities) {
      return null;
    }

    const firstWorkloadEntity = mapLocation.entities.find(
      e => e.type === 'WORKLOAD'
    );

    if (!firstWorkloadEntity) {
      return null;
    }

    const location = navigation.getOpenStackedNerdletLocation({
      id: 'workloads.home',
      urlState: {
        nerdletId: 'workloads.overview',
        entityId: firstWorkloadEntity.guid
      }
    });

    return (
      <Link
        to={location}
        className="detail-pane-view-workload-button detail-pane-cta"
      >
        <Icon color="#007e8a" type={Icon.TYPE.INTERFACE__OPERATIONS__SHOW} />
        View in Workloads
      </Link>
    );
  }

  render() {
    const { map, data, onClose, onMinimize } = this.props;

    if (!data) {
      return null;
    }

    const runbookUrl = data.runbookUrl || map.runbookUrl || false;
    const contactEmail = data.contactEmail || map.contactEmail || false;

    return (
      <header className="detail-panel-header">
        <Stack className="detail-panel-header-top-bar">
          <StackItem className="detail-panel-breadcrumbs-container">
            {data && (
              <ul className="detail-panel-breadcrumbs">
                <>
                  {data.location.country && (
                    <li className="detail-panel-breadcrumb">
                      {data.location.country}
                    </li>
                  )}
                  {data.location.region && (
                    <li className="detail-panel-breadcrumb">
                      {data.location.region}
                    </li>
                  )}
                  {data.location.municipality && (
                    <li className="detail-panel-breadcrumb">
                      {data.location.municipality}
                    </li>
                  )}
                </>
              </ul>
            )}
            {!data && <></>}
          </StackItem>
          <StackItem className="detail-panel-visiblity-controls">
            <Button
              sizeType={Button.SIZE_TYPE.SMALL}
              type={Button.TYPE.PLAIN}
              onClick={onClose}
              className="detail-panel-close-button"
              iconType={Button.ICON_TYPE.INTERFACE__SIGN__TIMES__V_ALTERNATE}
            />
            <span className="detail-panel-minimize-button" onClick={onMinimize}>
              <Icon
                type={Icon.TYPE.INTERFACE__CHEVRON__CHEVRON_RIGHT__WEIGHT_BOLD}
                color="#000E0E"
                sizeType={Icon.SIZE_TYPE.SMALL}
                className="detail-panel-minimize-button-icon"
              />
            </span>
          </StackItem>
        </Stack>
        <hr className="detail-panel-header-top-bar-hr" />
        <h3 className="detail-panel-title">
          <span
            className="detail-panel-title-status"
            style={{ backgroundColor: statusColor(data) }}
          />
          {data ? data.title : ''}
        </h3>
        <div className="detail-panel-cta-container">
          {data && this.renderEntityLink()}
          {contactEmail && (
            <a
              className="detail-pane-contact-button detail-pane-cta u-unstyledLink"
              href={`mailto:${contactEmail}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon
                color="#007e8a"
                type={Icon.TYPE.DOCUMENTS__DOCUMENTS__EMAIL}
              />
              Contact
            </a>
          )}
          {runbookUrl && (
            <a
              className="detail-pane-cta u-unstyledLink"
              href={runbookUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon
                color="#007e8a"
                type={Icon.TYPE.DOCUMENTS__DOCUMENTS__NOTES}
              />
              Runbook
            </a>
          )}
        </div>
        {data && data.query && (
          <>
            <hr className="detail-panel-header-top-bar-hr" />
            <div className="featured-chart-container">
              <FeaturedChart map={map} mapLocation={data} />
            </div>
          </>
        )}
      </header>
    );
  }
}

export default class DetailPanel extends React.PureComponent {
  static propTypes = {
    map: PropTypes.object,
    children: PropTypes.node,
    onClose: PropTypes.func,
    onMinimize: PropTypes.func,
    className: PropTypes.string,
    data: PropTypes.object,
    relatedEntities: PropTypes.array
  };

  constructor(props) {
    super(props);

    this.state = {
      closed: false,
      minimized: false
    };
  }

  /*
   Related Entities:

   Can look like:
   
   {
      __typename: "DashboardEntity"
      accountId: 630060
      domain: "VIZ"
      guid: "NjMwMDYwfFZJWnxEQVNIQk9BUkR8NzA2MzI2"
      name: "Joey Bagels"
      reporting: true
      tags: (3) [{…}, {…}, {…}]
      type: "DASHBOARD"
   }

   Or:

   {
     __typename: "ApmApplicationEntity"
      accountId: 630060
      alertSeverity: "CRITICAL"
      alertViolations: (2) [{…}, {…}]
      domain: "APM"
      guid: "NjMwMDYwfEFQTXxBUFBMSUNBVElPTnw2MDgwNzg2"
      name: "Origami Portal"
      recentAlertViolations: (10) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
      reporting: true
      tags: (13) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
      type: "APPLICATION"
   }

   */

  render() {
    const { children } = this.props;
    const { closed, minimized, className } = this.state;

    return (
      <div
        className={`detail-panel-container ${closed ? 'closed' : ''} ${
          minimized ? 'minimized' : ''
        } ${className || ''}`}
      >
        <Header {...this.props} />
        <div className="children-container">{children}</div>
      </div>
    );
  }
}
