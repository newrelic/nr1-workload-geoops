import React from 'react';

import { Timeline } from '@newrelic/nr1-community';
import { Icon, NerdletStateContext } from 'nr1';

// https://docs.newrelic.com/docs/new-relic-programmable-platform-introduction

export default class RecentIncidentsNerdlet extends React.Component {
  iconType(alertSeverity) {
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
  }

  iconColor(alertSeverity) {
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
  }

  render() {
    return (
      <NerdletStateContext.Consumer>
        {nerdletState => {
          const { recentViolations } = nerdletState;

          if (recentViolations) {
            return (
              <Timeline
                data={recentViolations}
                timestampField="openedAt"
                dateFormat="MM/dd/yyyy"
                timestampFormat="h:mm:ss a"
                labelField="label"
                iconType={data => {
                  return {
                    icon: this.iconType(data.event.alertSeverity),
                    color: this.iconColor(data.event.alertSeverity)
                  };
                }}
                eventContent={({ event }) => {
                  let timeline = Object.keys(event);
                  timeline = timeline.sort();
                  return (
                    <ul className="timeline-item-contents">
                      {timeline.map((attr, i) => {
                        if (event[attr]) {
							console.debug("Convert openedAt and closedAt from epoch integer to date string");
							var value = "";
							if ((attr == "openedAt") || (attr == "closedAt")) {
								value = new Date(event[attr]);
								value = value.toString();
							} else {
								value = event[attr];
							}
                          return (
                            <li key={i} className="timeline-item-contents-item">
                              <span className="key">{attr}: </span>
                              <span className="value">{event[attr]}</span>
                            </li>
                          );
                        }
                        return null;
                      })}
                    </ul>
                  );
                }}
              />
            );
          } else {
            return 'no data provided';
          }
        }}
      </NerdletStateContext.Consumer>
    );
  }
}
