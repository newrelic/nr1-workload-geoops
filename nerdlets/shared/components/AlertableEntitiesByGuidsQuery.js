import React from 'react';
import PropTypes from 'prop-types';

import get from 'lodash.get';

import { NerdGraphQuery, PlatformStateContext } from 'nr1';

import { ENTITIES_BY_GUIDS } from '../services/queries';
/*
 * We need to make a more specific GraphQL request for Workload
 * data than what you can get with something like <EntitiesByGuidsQuery>
 *
 * This emulates similar behavior by being declarative but allows us to customize the GraphQL request
 *
 * Momentarily pinned/limited to fetching Workloads - even though we're keeping the name generic to "Entity"
 */
export default class AlertableEntitiesByGuidsQuery extends React.PureComponent {
  static propTypes = {
    entityGuids: PropTypes.array,
    children: PropTypes.func.isRequired,
    fetchPolicyType: PropTypes.string,
    begin_time: PropTypes.number,
    end_time: PropTypes.number
  };

  /*
    Returned data (actor.account.entities):

    1. entity.alertSeverity

    2. entity.alertViolations (if returned)

    {
      __typename: "EntityAlertViolation"
      agentUrl: "https://rpm.newrelic.com/accounts/630060/applications/6080786?tw[start]=1583261363&tw[end]=1583263163"
      alertSeverity: null
      closedAt: null
      label: "Apdex < 0.87 for at least 5 minutes"
      level: "3"
      openedAt: 1583262540000
      violationId: 783011977
      violationUrl: "https://alerts.newrelic.com/accounts/630060/incidents/114014835/violations?id=783011977"
    }

    3. entity.recentAlertViolations (if returned)

    {
      __typename: "EntityAlertViolation"
      agentUrl: "https://rpm.newrelic.com/accounts/630060/applications/6080786?tw[start]=1583261363&tw[end]=1583263163"
      alertSeverity: null
      closedAt: null
      label: "Apdex < 0.87 for at least 5 minutes"
      level: "3"
      openedAt: 1583262540000
      violationId: 783011977
      violationUrl: "https://alerts.newrelic.com/accounts/630060/incidents/114014835/violations?id=783011977"
    }
  */

  render() {
    const {
      entityGuids,
      children,
      fetchPolicyType = NerdGraphQuery.FETCH_POLICY_TYPE.NO_CACHE,
      begin_time: propBeginTime,
      end_time: propEndTime
    } = this.props;

    return (
      <>
        {entityGuids && (
          <PlatformStateContext.Consumer>
            {platformState => {
              const { timeRange } = platformState;

              const { begin_time, end_time } = timeRange;

              if (!begin_time && !end_time) {
                console.debug(
                  'User did not supply a begin/end time via the Time Picker'
                );
              }

              return (
                <NerdGraphQuery
                  query={ENTITIES_BY_GUIDS}
                  variables={{
                    entityGuids,
                    includeTags: true,
                    includeAlertViolations: true,
                    begin_time: begin_time || propBeginTime,
                    end_time: end_time || propEndTime
                  }}
                  fetchPolicyType={fetchPolicyType}
                >
                  {({ loading, error, data }) => {
                    return children({
                      loading,
                      data: data ? get(data, 'actor.entities', []) : data,
                      error
                    });
                  }}
                </NerdGraphQuery>
              );
            }}
          </PlatformStateContext.Consumer>
        )}
      </>
    );
  }
}
