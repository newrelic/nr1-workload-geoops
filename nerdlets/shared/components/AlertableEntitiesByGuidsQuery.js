import React, { Component } from 'react';
import PropTypes from 'prop-types';

import get from 'lodash.get';

import { NerdGraphQuery, Spinner } from 'nr1';
import { NerdGraphError } from '@newrelic/nr1-community';

import { ENTITIES_BY_GUIDS } from '../services/queries';
/*
 * We need to make a more specific GraphQL request for Workload
 * data than what you can get with something like <EntitiesByGuidsQuery>
 *
 * This emulates similar behavior by being declarative but allows us to customize the GraphQL request
 *
 * Momentarily pinned/limited to fetching Workloads - even though we're keeping the name generic to "Entity"
 */
export default class AlertableEntitiesByGuidsQuery extends Component {
  static propTypes = {
    entityGuids: PropTypes.array,
    children: PropTypes.func.isRequired,
    fetchPolicyType: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.state = {
      //
    };
  }

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
      fetchPolicyType = NerdGraphQuery.FETCH_POLICY_TYPE.NO_CACHE
    } = this.props;

    // TO DO - Get timeRange from PlatformStateContext.Consumer
    const timeRange = {
      begin_time: Date.now() - 30 * 60 * 1000, // 30 min ago
      duration: 0,
      end_time: Date.now()
    };
    const { begin_time: startTime, end_time: endTime } = timeRange;

    // console.log(entityGuids);

    return (
      <>
        {entityGuids && (
          <NerdGraphQuery
            query={ENTITIES_BY_GUIDS}
            variables={{
              entityGuids,
              includeTags: true,
              includeAlertViolations: true,
              startTime,
              endTime
            }}
            fetchPolicyType={fetchPolicyType}
          >
            {({ loading, error, data }) => {
              if (loading) {
                return <Spinner />;
              }

              if (error) {
                return <NerdGraphError error={error} />;
              }

              return (
                <>
                  {children({
                    loading,
                    data: get(data, 'actor.entities', []),
                    error
                  })}
                </>
              );
            }}
          </NerdGraphQuery>
        )}
      </>
    );
  }
}
