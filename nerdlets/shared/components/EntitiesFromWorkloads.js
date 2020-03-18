import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash.get';

import { mapByGuid } from '../utils';

export default class EntitiesFromWorkloads extends React.PureComponent {
  static propTypes = {
    mapLocationEntities: PropTypes.object,
    children: PropTypes.func,
    workloads: PropTypes.object
  };

  constructor(props) {
    super(props);

    this.state = {
      entityGuids: [],
      workloadToEntityGuidsLookup: {}
    };
  }

  componentDidMount() {
    this.doWork();
  }

  groupByEntityType({ data }) {
    const initialState = { workloadEntities: [], otherEntities: [] };
    const entities = data.entities;

    if (!Array.isArray(entities)) {
      return initialState;
    }

    return entities.reduce((previousValue, currentValue) => {
      if (currentValue.entityType === 'WORKLOAD_ENTITY') {
        previousValue.workloadEntities.push(currentValue);
      } else {
        previousValue.otherEntities.push(currentValue);
      }
      return previousValue;
    }, initialState);
  }

  filterWorkloadResponse({ data, filterByWorkloadsLookup }) {
    const workloads = get(data, 'actor.account.workload.collections');
    const lookup = filterByWorkloadsLookup;

    const result = workloads.reduce(
      (previousValue, currentValue) => {
        const workloadGuid = currentValue.guid;
        // if (!workloadGuid) {
        //   console.log('Workload is missing guid');
        // }

        if (lookup[workloadGuid]) {
          const entityGuids = currentValue.entities.map(e => e.guid);

          previousValue.workloadToEntityGuidsLookup[workloadGuid] = [];
          previousValue.workloadToEntityGuidsLookup[workloadGuid].push(
            ...entityGuids
          );

          previousValue.workloadEntityGuids.push(...entityGuids);
        }

        return previousValue;
      },
      { workloadEntityGuids: [], workloadToEntityGuidsLookup: {} }
    );

    return result;
  }

  doWork() {
    const { mapLocationEntities, workloads } = this.props;

    // Group by workloads and non-workloads
    const { workloadEntities, otherEntities } = this.groupByEntityType({
      data: mapLocationEntities
    });

    const filterByWorkloadsLookup = mapByGuid({
      data: workloadEntities
    });
    const workloadGuids = Object.keys(filterByWorkloadsLookup);

    // Filter by workloads tied to this map
    const {
      workloadEntityGuids: filteredWorkloadEntities,
      workloadToEntityGuidsLookup
    } = this.filterWorkloadResponse({
      data: workloads,
      filterByWorkloadsLookup
    });

    // Combine entities with entities from workloads
    const allEntityGuids = workloadGuids.concat(
      otherEntities.concat(filteredWorkloadEntities)
    );

    this.setState({ entityGuids: allEntityGuids, workloadToEntityGuidsLookup });
  }

  render() {
    const { children } = this.props;
    const { entityGuids, workloadToEntityGuidsLookup } = this.state;

    return children({
      entityGuids,
      workloadToEntityGuidsLookup
    });
  }
}
