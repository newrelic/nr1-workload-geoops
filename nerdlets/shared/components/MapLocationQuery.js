import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { nerdStorageRequest } from '../utils';
import { getMapLocations } from '../services/map-location';

export default class MapLocationQuery extends Component {
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

    const { data, errors } = await nerdStorageRequest({
      service: getMapLocations,
      params: { accountId, document: map }
    });

    this.setState({
      loading: false,
      data,
      errors
    });
  }

  render() {
    const { data, loading, errors } = this.state;
    const { children } = this.props;
    return (
      <>
        {children({
          loading,
          data,
          errors
        })}
      </>
    );
  }
}
