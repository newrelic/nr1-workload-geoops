/* eslint-disable react/prop-types */
import React from 'react';
import PropTypes from 'prop-types';

import { Button, Icon, Stack, StackItem, navigation, Link } from 'nr1';

import { statusColor } from '../../geo-ops-nerdlet/utils';

class Header extends React.PureComponent {
  renderEntityLink() {
    const { data, onClose, onMinimize, featuredChart } = this.props;
    const location = navigation.getOpenStackedEntityLocation(
      data.entities[0].guid
    );
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
    const { data, onClose, onMinimize, featuredChart } = this.props;

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
          <a className="detail-pane-contact-button detail-pane-cta">
            <Icon
              color="#007e8a"
              type={Icon.TYPE.DOCUMENTS__DOCUMENTS__EMAIL}
            />
            Contact
          </a>
          <a className="detail-pane-cta">
            <Icon
              color="#007e8a"
              type={Icon.TYPE.DOCUMENTS__DOCUMENTS__NOTES}
            />
            Runbook
          </a>
        </div>
        {featuredChart && (
          <>
            <hr className="detail-panel-header-top-bar-hr" />
            <div className="featured-chart-container">{featuredChart}</div>
          </>
        )}
      </header>
    );
  }
}

export default class DetailPanel extends React.PureComponent {
  static propTypes = {
    children: PropTypes.node,
    onClose: PropTypes.func,
    onMinimize: PropTypes.func,
    featuredChart: PropTypes.node,
    className: PropTypes.string,
    data: PropTypes.object
  };

  constructor(props) {
    super(props);

    this.state = {
      closed: false,
      minimized: false
    };
  }

  render() {
    const { closed, minimized, className } = this.state;
    return (
      <div
        className={`detail-panel-container ${closed ? 'closed' : ''} ${
          minimized ? 'minimized' : ''
        } ${className || ''}`}
      >
        <Header {...this.props} />
        <div className="children-container">{this.props.children}</div>
      </div>
    );
  }
}
