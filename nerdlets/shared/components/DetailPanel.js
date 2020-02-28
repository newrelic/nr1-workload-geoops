import React from 'react';
import PropTypes from 'prop-types';

import { Button, Icon, Stack, StackItem } from 'nr1';

class Header extends React.PureComponent {
  render() {
    return (
      <header className="detail-panel-header">
        <Stack className="detail-panel-header-top-bar">
          <StackItem className="detail-panel-breadcrumbs-container">
            <ul className="detail-panel-breadcrumbs">
              <li className="detail-panel-breadcrumb">Canada</li>
              <li className="detail-panel-breadcrumb">Ontario</li>
              <li className="detail-panel-breadcrumb">Toronto</li>
              <li className="detail-panel-breadcrumb">Alexandria Park</li>
            </ul>
          </StackItem>
          <StackItem className="detail-panel-visiblity-controls">
            <Button
              sizeType={Button.SIZE_TYPE.SMALL}
              type={Button.TYPE.PLAIN}
              onClick={this.props.onClose}
              className="detail-panel-close-button"
              iconType={Button.ICON_TYPE.INTERFACE__SIGN__TIMES__V_ALTERNATE}
            />
            <span
              className="detail-panel-minimize-button"
              onClick={this.props.onMinimize}
            >
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
        <h3 className="detail-panel-title">Alexandria Park - CA47284</h3>
        <div className="detail-panel-cta-container">
          <a className="detail-pane-view-workload-button detail-pane-cta">
            <Icon
              color="#007e8a"
              type={Icon.TYPE.INTERFACE__OPERATIONS__SHOW}
            />
            View in Workloads
          </a>
          <a className="detail-pane-contact-button detail-pane-cta">
            <Icon
              color="#007e8a"
              type={Icon.TYPE.DOCUMENTS__DOCUMENTS__EMAIL}
            />
            Contact manager
          </a>
        </div>
        {this.props.featuredChart && (
          <>
            <hr className="detail-panel-header-top-bar-hr" />
            <div className="featured-chart-container">
              {this.props.featuredChart}
            </div>
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
    className: PropTypes.string
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
