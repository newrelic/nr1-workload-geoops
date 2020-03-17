import React from 'react';
import PropTypes from 'prop-types';
import cloneDeep from 'lodash.clonedeep';

// TO DO - Define a construct for a "filter" and a common methodology for applying an array of these "filters" to the dataset
// For MVP - just pass a region/favorites filters as props

export default class FilteredMapLocations extends React.PureComponent {
  static propTypes = {
    children: PropTypes.func,
    mapLocations: PropTypes.array,
    filters: PropTypes.array,
    regionFilter: PropTypes.string,
    favoriteFilter: PropTypes.bool
  };

  constructor(props) {
    super(props);

    this.state = {
      filtered: props.mapLocations || []
    };
  }

  componentDidMount() {
    this.update();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.mapLocations !== this.props.mapLocations ||
      prevProps.regionFilter !== this.props.regionFilter ||
      prevProps.filters !== this.props.filters ||
      prevProps.favoriteFilter !== this.props.favoriteFilter
    ) {
      this.update();
    }
  }

  update() {
    const { mapLocations, filters, regionFilter, favoriteFilter } = this.props;

    let filtered = cloneDeep(mapLocations);

    if (regionFilter) {
      filtered = mapLocations.filter(m => m.location.region === regionFilter);
    }

    if (favoriteFilter) {
      filtered = filtered.filter(m => m.favorite === favoriteFilter);
    }

    this.setState({ filtered });
  }

  render() {
    const { children } = this.props;
    const { filtered } = this.state;

    return children({ filteredMapLocations: filtered });
  }
}
