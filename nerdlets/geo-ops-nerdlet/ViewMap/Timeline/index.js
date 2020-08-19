import React from 'react';
import { format } from 'date-fns';
import { Icon, navigation } from 'nr1';
import PropTypes from 'prop-types';
import { kebabCase, lowerCase } from 'lodash';
import { PACKAGE_UUID } from '../../../shared/constants';
import { EmptyState } from '@newrelic/nr1-community';

const Timeline = ({ activeMapLocation }) => {
  if (!activeMapLocation) {
    return <div className="timeline-container mini-timeline" />;
  }

  const iconType = alertSeverity => {
    switch (alertSeverity) {
      case 'CRITICAL':
        return Icon.TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__APPLICATION__S_ERROR;
      case 'WARNING':
        return Icon.TYPE
          .HARDWARE_AND_SOFTWARE__SOFTWARE__APPLICATION__S_WARNING;
      case 'NOT_ALERTING':
        return Icon.TYPE
          .HARDWARE_AND_SOFTWARE__SOFTWARE__APPLICATION__A_CHECKED;
      case 'NOT_CONFIGURED':
        return Icon.TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__APPLICATION__S_OK;
    }
  };

  const iconColor = alertSeverity => {
    switch (alertSeverity) {
      case 'CRITICAL':
        return '#BF0016';
      case 'WARNING':
        return '#9C5400';
      case 'NOT_ALERTING':
        return '#3CA653';
      case 'NOT_CONFIGURED':
        return '#464e4e';
    }
  };

  let timelineItems = null;
  if (activeMapLocation.recentAlertViolations && activeMapLocation.recentAlertViolations.length > 0) {
    timelineItems = activeMapLocation.recentAlertViolations.map(violation => {
        return (
          <div
            className={`timeline-item impact-${kebabCase(
              violation.alertSeverity
            )}`}
            key={violation.violationId}
            onClick={() => {
              navigation.openStackedNerdlet({
                id: `${PACKAGE_UUID}.recent-incidents`,
                urlState: {
                  recentViolations: activeMapLocation.recentAlertViolations,
                  clickedViolation: violation
                }
              });
            }}
          >
            <div className="timeline-item-timestamp">
              <span className="timeline-timestamp-date">
                {format(violation.openedAt, 'MM/dd/yy')}
              </span>
              <span className="timeline-timestamp-time">
                {format(violation.openedAt, 'p')}
              </span>
            </div>
            <div className="timeline-item-dot" />
            <div className="timeline-item-body">
              <div className="timeline-item-body-header">
                <div
                  className="timeline-item-symbol"
                  title={`Impact: ${lowerCase(violation.alertSeverity)}`}
                >
                  <Icon
                    type={iconType(violation.alertSeverity)}
                    color={iconColor(violation.alertSeverity)}
                  />
                </div>
                <div className="timeline-item-title">{violation.label}</div>
              </div>
            </div>
          </div>
        );
      });
    } else {
      timelineItems = <EmptyState
        heading="No Recent Alerts"
        description="None of the Entities that are assigned to this location have experienced any recent alerts."
        buttonText=""
      />;
    }
  return (
    <div className="timeline-container mini-timeline">{timelineItems}</div>
  );
};

Timeline.propTypes = {
  activeMapLocation: PropTypes.object
};

export default Timeline;
