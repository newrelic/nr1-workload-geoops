import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon, Stack, navigation, Link } from 'nr1';
import FeaturedChart from '../FeaturedChart/FeaturedChart';

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

import { statusColor } from '../../../utils';

export default class Header extends React.PureComponent {
  static propTypes = {
    map: PropTypes.object,
    onClose: PropTypes.func,
    onMinimize: PropTypes.func,
    data: PropTypes.object,
    openChartBuilder: PropTypes.func
  };

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
      <header>
        <Stack>
          <BreadcrumbContainer>
            {data && (
              <Breadcrumbs>
                <>
                  {data.location.country && (
                    <Breadcrumb>{data.location.country}</Breadcrumb>
                  )}
                  {data.location.region && (
                    <Breadcrumb>{data.location.region}</Breadcrumb>
                  )}
                  {data.location.municipality && (
                    <Breadcrumb>{data.location.municipality}</Breadcrumb>
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
                type={Icon.TYPE.INTERFACE__CHEVRON__CHEVRON_RIGHT__WEIGHT_BOLD}
                color="#000E0E"
                sizeType={Icon.SIZE_TYPE.SMALL}
              />
            </MinimizeButton>
          </VisibilityControls>
        </Stack>
        <HorizontalRule />
        <H3>
          <Status style={{ backgroundColor: statusColor(data) }} />
          {data ? data.title : ''}
        </H3>
        <CTAContainer>
          {data && this.renderEntityLink(data)}
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
        {data && data.query && (
          <>
            <HorizontalRule />
            <ChartContainer>
              <FeaturedChart
                map={map}
                mapLocation={data}
                openChartBuilder={this.props.openChartBuilder}
              />
            </ChartContainer>
          </>
        )}
      </header>
    );
  }
}
