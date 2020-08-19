import React from 'react';
import PropTypes from 'prop-types';
import { getEntitiesByGuidsQuery } from '../../../shared/services/queries';
import { NerdGraphQuery } from 'nr1';

export default class MapLocationEntityQuery extends React.PureComponent {
  /**
   * STEP 1: Given a list of `entityGuids`, `getEntitiesByGuidsQuery` breaks down the list into 25-unit chunks of
   * searches and then recombine the results into one list of `entities`.
   * STEP 2: For each of the workloads, retrieve the `collection.status.value` to set `entity.alertSeverity` and `collection.entitySearchQuery` is added to the entity as a new attribute, `entitySearchQuery`.
   */
  static async query({
    entityGuids,
    begin_time,
    end_time,
    fetchPolicyType = NerdGraphQuery.FETCH_POLICY_TYPE.NO_CACHE
  }) {
    const variables = { begin_time, end_time, entityGuids };
    const query = getEntitiesByGuidsQuery(variables);
    // console.debug('MapLocationEntityQuery', query);
    const { errors, data } = await NerdGraphQuery.query({
      query,
      variables,
      fetchPolicyType
    });
    if (errors) {
      return { errors, entities: null };
    }
    // console.debug('MapLocationEntityQuery.query', data);
    const { actor } = data;
    let entities = [];
    if (actor) {
      Object.keys(actor).forEach(query => {
        if (query.startsWith('query')) {
          entities = [...entities, ...actor[query]];
        }
      });
    }
    return { entities, errors: null };
  }

  static propTypes = {
    map: PropTypes.object,
    entityGuids: PropTypes.array,
    begin_time: PropTypes.number,
    end_time: PropTypes.number,
    children: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      errors: null,
      entities: null
    };
  }

  async componentDidMount() {
    await this.load();
  }

  /**
   * If the map changed, reload the UI
   * else if the begin and end time has changed, reload the data but don't fully reset the UI
   * the difference is the outcome of how the load method is called
   */
  async componentDidUpdate(prevProps) {
    if (
      prevProps.map &&
      this.props.map &&
      prevProps.map.guid !== this.props.map.guid
    ) {
      this.load({ reset: true });
    } else if (
      (prevProps.begin_time &&
        this.props.begin_time &&
        prevProps.begin_time !== this.props.begin_time) ||
      (prevProps.end_time &&
        this.props.end_time &&
        prevProps.end_time !== this.props.end_time)
    ) {
      this.load({ reset: false });
    }
  }

  async load() {
    this.setState({ loading: true });

    const { entities, errors } = await MapLocationEntityQuery.query({
      entityGuids: this.props.entityGuids
    });

    this.setState({
      loading: false,
      entities,
      errors
    });
  }

  render() {
    const { entities, loading, errors } = this.state;
    const { children } = this.props;
    return children({
      loading,
      entities,
      errors
    });
  }
}
