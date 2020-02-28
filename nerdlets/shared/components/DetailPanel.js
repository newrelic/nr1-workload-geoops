import React from 'react';
import PropTypes from 'prop-types';

import { Button, Icon, Stack, StackItem } from 'nr1';

class Header extends React.PureComponent {
  static propTypes = {
    featuredChart: PropTypes.node,
    data: PropTypes.array
  };

  constructor(props) {
    super(props);

    this.state = {
      closed: false,
      minimized: false
    };

    this.handleCloseButton = this.handleCloseButton.bind(this);
    this.handleMinimizeButton = this.handleMinimizeButton.bind(this);
  }

  handleCloseButton() {
    this.setState({ closed: true });
  }

  handleMinimizeButton() {
    this.setState(prevState => ({
      minimized: !prevState.minimized
    }));
  }

  render() {
    const { featuredChart } = this.props;

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
              onClick={this.handleCloseButton}
              className="detail-panel-close-button"
              iconType={Button.ICON_TYPE.INTERFACE__SIGN__TIMES__V_ALTERNATE}
            />
            <span
              className="detail-panel-minimize-button"
              onClick={this.handleMinimizeButton}
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
        <h3 className="detail-panel-title">I'm the title</h3>
        <div className="detail-panel-cta-container">
          <Button
            className="detail-pane-view-workload-button"
            sizeType={Button.SIZE_TYPE.SMALL}
            type={Button.TYPE.PLAIN}
            iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__SHOW}
          >
            View in Workloads
          </Button>
          <Button
            className="detail-pane-contact-button"
            sizeType={Button.SIZE_TYPE.SMALL}
            type={Button.TYPE.PLAIN}
            iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__EMAIL}
          >
            Contact manager
          </Button>
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
  render() {
    return (
      <div className="detail-panel-container">
        <Header
          {...this.props}
          defaultOnClose={this.handleCloseButton}
          defaultOnMinimize={this.handleMinimizeButton}
        />
        <div className="children-container">Children here</div>
      </div>
    );
  }
}
