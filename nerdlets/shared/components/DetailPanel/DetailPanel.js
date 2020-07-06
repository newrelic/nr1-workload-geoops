import React from 'react';
import PropTypes from 'prop-types';

import { navigation } from 'nr1';

import Header from './Header/Header';
import { DetailPanelContainer, ChildrenContainer } from './styles';

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

  openChartBuilder(query, account) {
    if (query && account) {
      const nerdlet = {
        id: 'wanda-data-exploration.nrql-editor',
        urlState: {
          initialActiveInterface: 'nrqlEditor',
          initialAccountId: account.id,
          initialNrqlValue: query,
          isViewingQuery: true
        }
      };
      navigation.openOverlay(nerdlet);
    }
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

    return (
      <DetailPanelContainer>
        <Header
          {...this.props}
          openChartBuilder={(query, account) =>
            this.openChartBuilder(query, account)
          }
        />
        <ChildrenContainer>{children}</ChildrenContainer>
      </DetailPanelContainer>
    );
  }
}
