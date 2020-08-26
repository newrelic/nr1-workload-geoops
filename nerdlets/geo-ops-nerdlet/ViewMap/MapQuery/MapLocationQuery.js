import React from 'react';
import PropTypes from 'prop-types';

import uniq from 'lodash.uniq';

import { nerdStorageRequest } from '../../../shared/utils';
import { getMapLocations } from '../../../shared/services/map-location';

const entitiesFromMapLocations = ({ mapLocations }) => {
  const allEntities = mapLocations.reduce((previousValue, currentValue) => {
    const entities = currentValue.document.entities || [];
    previousValue.push(...entities);
    return previousValue;
  }, []);
  const entityGuids = uniq(allEntities.map(e => e.guid));
  return {
    entities: allEntities,
    entityGuids
  };
};

export default class MapLocationQuery extends React.PureComponent {
  /**
   * Returns object with three attributes:
   * - `mapLocations` the list of locations
   * - `entityGuids` reduced list of all entityGuids from all locations
   * - `errors` if the query generated errors, return those
   */
  static async query({ map }) {
    const { accountId } = map;

    const { data: mapLocations, errors } = await nerdStorageRequest({
      service: getMapLocations,
      params: { accountId: parseInt(accountId, 10), document: map }
    });

    const { entityGuids } = entitiesFromMapLocations({
      mapLocations
    });
    return {
      mapLocations: mapLocations.map(m => m.document),
      entityGuids,
      errors
    };
  }

  static propTypes = {
    children: PropTypes.func.isRequired,
    map: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loading: true,
      errors: []
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
    }
  }

  async load() {
    this.setState({ loading: true });

    const { mapLocations, entityGuids, errors } = await MapLocationQuery.query({
      map: this.props.map
    });

    this.setState({
      loading: false,
      data: { mapLocations, entityGuids },
      errors
    });
  }

  render() {
    const { data, loading, errors } = this.state;
    const { children } = this.props;
    return children({
      loading,
      data,
      errors
    });
  }
}
