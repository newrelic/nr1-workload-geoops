import React from 'react';
import PropTypes from 'prop-types';

import uniq from 'lodash.uniq';

import { nerdStorageRequest } from '../utils';
import { getMapLocations } from '../services/map-location';

export default class MapLocationQuery extends React.PureComponent {
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

  async load() {
    this.setState({ loading: true });

    const { map } = this.props;
    const { accountId } = map;

    const { data: mapLocations, errors } = await nerdStorageRequest({
      service: getMapLocations,
      params: { accountId, document: map }
    });

    const { entityGuids } = this.entitiesFromMapLocations({
      mapLocations
    });

    this.setState({
      loading: false,
      data: { mapLocations, entityGuids },
      errors
    });
  }

  entitiesFromMapLocations({ mapLocations }) {
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
