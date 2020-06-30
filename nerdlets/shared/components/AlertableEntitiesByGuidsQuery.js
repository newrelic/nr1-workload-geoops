import React from 'react';
import PropTypes from 'prop-types';

import { NerdGraphQuery, PlatformStateContext } from 'nr1';

import { getEntitiesByGuidsQuery } from '../services/queries';
/*
 * <EntitiesByGuidsQuery> only provides access to the AlertableEntityOutline and not the AlertableEntity
 * This component is meant to emulate similar behavior but allows us to customize the GraphQL request
 */

/*
 * Note:
 * NerdGraphQuery seems to render "with side effects", even though nothing has changed and data is not refetched.
 * It creates and returns a new object reference for { loading, data, error }, so simple equality comparison does not suffice.
 * We may need to convert this component from a PureComponent to a regular one so we can control this behavior.
 */

export default class AlertableEntitiesByGuidsQuery extends React.PureComponent {
  static propTypes = {
    entityGuids: PropTypes.array,
    children: PropTypes.func.isRequired,
    fetchPolicyType: PropTypes.string,
    begin_time: PropTypes.number,
    end_time: PropTypes.number
  };

  constructor(props) {
    super(props);
    this.state = {
      variables: {}
    };
  }

  componentDidMount() {
    this.update();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.entityGuids !== this.props.entityGuids ||
      prevProps.begin_time !== this.props.begin_time ||
      prevProps.end_time !== this.props.end_time
    ) {
      this.update();
    }
  }

  update() {
    const {
      entityGuids,
      begin_time: propBeginTime,
      end_time: propEndTime
    } = this.props;

    const variables = {
      entityGuids,
      includeTags: true,
      includeAlertViolations: true,
      begin_time: propBeginTime,
      end_time: propEndTime
    };

    this.setState({
      variables
    });
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

    const { variables } = this.state;

    return (
      <>
        {entityGuids && (
          <PlatformStateContext.Consumer>
            {platformState => {
              const { timeRange } = platformState;

              const { begin_time, end_time } = timeRange;

              if (begin_time && end_time) {
                variables.begin_time = begin_time;
                variables.end_time = end_time;
              } else {
                // console.debug(
                //   'User did not supply a begin/end time via the Time Picker'
                // );
              }
              const query =
                entityGuids.length > 0 && variables.entityGuids.length > 0
                  ? getEntitiesByGuidsQuery(variables)
                  : false;
              if (!query) {
                return children({
                  loading: false,
                  data: [],
                  error: null
                });
              } else {
                return (
                  <NerdGraphQuery
                    query={query}
                    fetchPolicyType={fetchPolicyType}
                    variables={variables}
                  >
                    {({ loading, error, data }) => {
                      const { actor } = data;
                      let entities = [];
                      if (actor) {
                        Object.keys(actor).forEach(query => {
                          if (query.startsWith('query')) {
                            entities = [...entities, ...actor[query]]
                          }
                        });
                      }
                      return children({
                        loading,
                        data: entities,
                        error
                      });
                    }}
                  </NerdGraphQuery>
                );
              }
            }}
          </PlatformStateContext.Consumer>
        )}
      </>
    );
  }
}
