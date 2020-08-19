import React from 'react';
import PropTypes from 'prop-types';
import cloneDeep from 'lodash.clonedeep';

// TODO: Define a construct for a "filter" and a common methodology for applying an array of these "filters" to the dataset
// For MVP - just pass a region/favorites filters as props

export default class FilteredMapLocations extends React.PureComponent {
  static propTypes = {
    children: PropTypes.func,
    mapLocations: PropTypes.array,
    filters: PropTypes.array,
    regionFilter: PropTypes.string,
    favoriteFilter: PropTypes.bool,
    favoriteLocations: PropTypes.object,
    alertFilter: PropTypes.string
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
    /* eslint-disable no-unused-vars */
    const {
      mapLocations,
      filters,
      regionFilter,
      favoriteFilter,
      favoriteLocations,
      alertFilter
    } = this.props;
    /* eslint-enable */

    let filtered = cloneDeep(mapLocations);

    if (regionFilter) {
      filtered = mapLocations.filter(m => m.location.region === regionFilter);
    }

    if (favoriteFilter !== null) {
      filtered = filtered.filter(m =>
        favoriteFilter
          ? favoriteLocations[m.externalId]
          : !favoriteLocations[m.externalId]
      );
    }

    if (alertFilter !== null) {
      filtered = filtered.filter(m => {
        if (
          m.mostCriticalEntity &&
          m.mostCriticalEntity.alertSeverity === alertFilter
        ) {
          return true;
        }

        if (!m.mostCriticalEntity) {
          if (alertFilter === 'NOT_CONFIGURED') {
            return true;
          }
        }
        return false;
      });
    }

    this.setState({ filtered });
  }

  render() {
    const { children } = this.props;
    const { filtered } = this.state;

    return children({ filteredMapLocations: filtered });
  }
}
