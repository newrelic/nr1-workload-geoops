import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon, Stack, navigation, Link } from 'nr1';
import FeaturedChart from '../FeaturedChart';

import {
  BreadcrumbContainer,
  Breadcrumbs,
  Breadcrumb,
  VisibilityControls,
  MinimizeButton,
  MinimizeIcon,
  HorizontalRule,
  H3,
  Status,
  CTAContainer,
  CTALink,
  ChartContainer
} from './styles';

import { statusColor, isUrlSafe } from '../../../../shared/utils';

export default class Header extends React.PureComponent {
  static propTypes = {
    map: PropTypes.object,
    onClose: PropTypes.func,
    onMinimize: PropTypes.func,
    mapLocation: PropTypes.object,
    openChartBuilder: PropTypes.func
  };

  renderEntityLink(mapLocation) {
    // console.debug(mapLocation);
    if (!mapLocation || !mapLocation.entities) {
      return null;
    }

    const workloadEntities = mapLocation.entities.filter(
      e => e.type === 'WORKLOAD'
    );

    if (!workloadEntities) {
      return null;
    }

    return (
      <>
        {workloadEntities.map((workload, i) => {
          const location = navigation.getOpenStackedNerdletLocation({
            id: 'workloads.launcher',
            urlState: {
              nerdletId: 'workloads.overview',
              entityId: workload.guid
            }
          });
          return (
            <Link
              key={`workloadLink${i}`}
              to={location}
              className="detail-pane-view-workload-button"
            >
              <Icon
                color="#007e8a"
                type={Icon.TYPE.INTERFACE__OPERATIONS__SHOW}
              />
              Workload {i < 0 ? i + 1 : ''}
            </Link>
          );
        })}
      </>
    );
  }

  render() {
    const { map, mapLocation, onClose, onMinimize } = this.props;

    if (!mapLocation) {
      return null;
    }
    const rawUrl = mapLocation.runbookUrl || map.runbookUrl || '';
    const runbookUrl = isUrlSafe(rawUrl) && rawUrl;
    const contactEmail = mapLocation.contactEmail || map.contactEmail || false;

    return (
      <header>
        <Stack>
          <BreadcrumbContainer>
            {mapLocation && (
              <Breadcrumbs>
                <>
                  {mapLocation.location.country && (
                    <Breadcrumb>{mapLocation.location.country}</Breadcrumb>
                  )}
                  {mapLocation.location.region && (
                    <Breadcrumb>{mapLocation.location.region}</Breadcrumb>
                  )}
                  {mapLocation.location.municipality && (
                    <Breadcrumb>{mapLocation.location.municipality}</Breadcrumb>
                  )}
                </>
              </Breadcrumbs>
            )}
          </BreadcrumbContainer>
          <VisibilityControls>
            <Button
              sizeType={Button.SIZE_TYPE.SMALL}
              type={Button.TYPE.PLAIN}
              onClick={onClose}
              iconType={Button.ICON_TYPE.INTERFACE__SIGN__TIMES__V_ALTERNATE}
            />
            <MinimizeButton onClick={onMinimize}>
              <MinimizeIcon
                type={
                  Icon.TYPE
                    .INTERFACE__CHEVRON__CHEVRON_RIGHT__WEIGHT_BOLD__SIZE_8
                }
                color="#000E0E"
              />
            </MinimizeButton>
          </VisibilityControls>
        </Stack>
        <HorizontalRule />
        <H3>
          <Status style={{ backgroundColor: statusColor(mapLocation) }} />
          {mapLocation ? mapLocation.title : ''}
        </H3>
        <CTAContainer>
          {mapLocation && this.renderEntityLink(mapLocation)}
          {contactEmail && (
            <CTALink
              className="u-unstyledLink"
              href={`mailto:${contactEmail}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon
                color="#007e8a"
                type={Icon.TYPE.DOCUMENTS__DOCUMENTS__EMAIL}
              />
              Contact
            </CTALink>
          )}
          {runbookUrl && (
            <CTALink
              className="u-unstyledLink"
              href={runbookUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon
                color="#007e8a"
                type={Icon.TYPE.DOCUMENTS__DOCUMENTS__NOTES}
              />
              Runbook
            </CTALink>
          )}
        </CTAContainer>
        {mapLocation && mapLocation.query && (
          <>
            <HorizontalRule />
            <ChartContainer>
              <FeaturedChart
                map={map}
                mapLocation={mapLocation}
                openChartBuilder={this.props.openChartBuilder}
              />
            </ChartContainer>
          </>
        )}
      </header>
    );
  }
}
