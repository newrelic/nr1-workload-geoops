import React from 'react';
import PropTypes from 'prop-types';

import {
  navigation,
  Tabs,
  TabsItem,
  Table,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableRowCell,
  EntityTitleTableRowCell,
  Spinner
} from 'nr1';

import Timeline from '../Timeline';
import { get, lowerCase, startCase } from 'lodash';

import LocationMetadata from '../LocationMetadata';
import composeEntitySummary from '../EntitySummary';

import { NerdGraphError, GenericError } from '@newrelic/nr1-community';

import Header from './Header';
import DetailPanelQuery from '../DetailPanelQuery';
import { DetailPanelContainer, ChildrenContainer } from './styles';

const findTooComplexQueryError = error => {
  return (
    error.message.indexOf(
      'Your query was too complex and could not be resolved.'
    ) > -1
  );
};

export default class DetailPanel extends React.PureComponent {
  static propTypes = {
    map: PropTypes.object, // NOTE: we need this to pass down the component tree
    onClose: PropTypes.func,
    onMinimize: PropTypes.func,
    className: PropTypes.string,
    mapLocation: PropTypes.object,
    begin_time: PropTypes.number,
    end_time: PropTypes.number
  };

  openStackedEntity(guid) {
    navigation.openStackedEntity(guid);
  }

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
    const { mapLocation } = this.props;
    return (
      <DetailPanelContainer>
        <Header
          {...this.props}
          openChartBuilder={(query, account) =>
            this.openChartBuilder(query, account)
          }
        />
        <ChildrenContainer>
          <DetailPanelQuery mapLocation={mapLocation}>
            {({
              loading,
              errors,
              recentAlertViolations,
              entities: distilledEntities
            }) => {
              if (loading) {
                return <Spinner />;
              }
              const tooComplexWorkloadError =
                errors && errors.find(findTooComplexQueryError);
              if (errors && !tooComplexWorkloadError) {
                return (
                  <>
                    {errors.map((error, i) => {
                      if (error.graphQLErrors) {
                        return <NerdGraphError key={i} error={error} />;
                      } else {
                        return (
                          <GenericError key={i}
                            error="An error occurred."
                            errorDescription={error.message}
                          />
                        );
                      }
                    })}
                  </>
                );
              }
              if (!errors) {
                mapLocation.recentAlertViolations = recentAlertViolations;
                mapLocation.entities = distilledEntities;
              }
              return (
                <Tabs style={{ height: '100%' }}>
                  <TabsItem
                    value="tab-1"
                    label="Recent incidents"
                    className="no-padding"
                  >
                    {tooComplexWorkloadError ? (
                      <GenericError
                        error="Unable to retrieve Location alerts"
                        errorDescription={
                          errors.find(findTooComplexQueryError).message
                        }
                      />
                    ) : (
                      <Timeline activeMapLocation={mapLocation} />
                    )}
                  </TabsItem>
                  <TabsItem
                    value="tab-2"
                    label="Metadata"
                    className="no-padding"
                  >
                    {mapLocation ? (
                      <LocationMetadata activeMapLocation={mapLocation} />
                    ) : (
                      <></>
                    )}
                  </TabsItem>
                  <TabsItem
                    value="tab-3"
                    label={`Entity summary (${
                      get(mapLocation, 'entities', []).length
                    })`}
                    className="entity-summary-tab"
                  >
                    <Table
                      spacingType={[
                        Table.SPACING_TYPE.NONE,
                        Table.SPACING_TYPE.NONE
                      ]}
                      items={composeEntitySummary(
                        mapLocation ? mapLocation.entities : []
                      )}
                    >
                      <TableHeader>
                        <TableHeaderCell width="65%">Name</TableHeaderCell>
                        <TableHeaderCell>Type</TableHeaderCell>
                      </TableHeader>

                      {({ item }) => (
                        <TableRow
                          onClick={() => this.openStackedEntity(item.guid)}
                        >
                          <EntityTitleTableRowCell value={item} />
                          <TableRowCell>
                            {startCase(lowerCase(item.type))}
                          </TableRowCell>
                        </TableRow>
                      )}
                    </Table>
                  </TabsItem>
                </Tabs>
              );
            }}
          </DetailPanelQuery>
        </ChildrenContainer>
      </DetailPanelContainer>
    );
  }
}
