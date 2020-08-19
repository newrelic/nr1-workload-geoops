import React from 'react';
import PropTypes from 'prop-types';
import { NerdGraphQuery } from 'nr1';
import get from 'lodash.get';
import {
  getWorkloadEntitySearchQuery,
  getWorkloadEntityGuidsQuery,
  getEntitiesByGuidsQuery
} from '../../../shared/services/queries';
import {
  sortEntitiesByAlertSeverity,
  sortAlertViolations
} from '../../../shared/utils';

export default class DetailPanelQuery extends React.PureComponent {
  /**
   * STEP 1: Distill the top level entities assigned to a mapLocation into:
   *   - a list of workloads
   *   - a list of non-workloads
   * STEP 2: Retrieve the entitySearchQuery for all workloads in this mapLocation
   * STEP 3: Retrieve the entity guids for all the entities in all the workloads
   * STEP 4: Build one list of entity guids
   * STEP 5: Build and execute a NerdGraph request that queries for a list of entities and their 10 most recent alert violations
   * STEP 6: Reduce both down to ordered lists
   *   - entities arranged by alertSeverity
   *   - recentAlertViolations arranged by date
   */
  static async query({ mapLocation }) {
    // STEP 1: Distill the top level entities assigned to a mapLocation into:
    const workloads = mapLocation.orderedEntities.filter(
      e => e.type === 'WORKLOAD'
    );
    const otherEntities = mapLocation.orderedEntities.filter(
      e => e.type !== 'WORKLOAD'
    );

    // STEP 2: Retrieve the entitySearchQuery for all workloads in this mapLocation
    const workloadEntitySearchQuery = getWorkloadEntitySearchQuery({
      workloads,
      mapLocation
    });
    const {
      data: workloadEntitySearchQueryData,
      errors: workEntitySearchQueryErrors
    } = await NerdGraphQuery.query({ query: workloadEntitySearchQuery });
    if (workEntitySearchQueryErrors) {
      console.debug("Return error for query", workloadEntitySearchQuery);
      return { errors: workEntitySearchQueryErrors };
    }

    // STEP 3: Retrieve the entity guids for all the entities in all the workloads
    const entitySearchQueries = [];
    workloads.forEach(workload => {
      entitySearchQueries.push(
        get(
          workloadEntitySearchQueryData,
          `actor.${workload.guid}.workload.collection.entitySearchQuery`
        )
      );
    });
    const workloadEntityGuidsQuery = getWorkloadEntityGuidsQuery({
      entitySearchQueries
    });
    const {
      data: workloadEntityGuidsData,
      errors: workloadEntityGuidsErrors
    } = await NerdGraphQuery.query({ query: workloadEntityGuidsQuery });
    if (workloadEntityGuidsErrors) {
      console.debug("Return error for query", workloadEntityGuidsQuery);
      return { errors: workloadEntityGuidsErrors };
    }

    // STEP 4: Build one list of entity guids
    let entityGuids = [];
    const { actor: workloadEntityGuidsActor } = workloadEntityGuidsData;

    Object.keys(workloadEntityGuidsActor).forEach(query => {
      if (query.startsWith('workloadQuery')) {
        const workloadEntities = get(
          workloadEntityGuidsActor,
          `${query}.results.entities`
        );
        // console.debug(workloadEntities);
        entityGuids = [...entityGuids, ...workloadEntities.map(we => we.guid)];
      }
    });

    otherEntities.forEach(entity => {
      entityGuids.push(entity.guid);
    });

    // STEP 5: Build and execute a NerdGraph request that queries for a list of entities and their 10 most recent alert violations
    const variables = {
      includeAlertViolations: false,
      includeRecentAlertViolations: true
    };
    const entityQuery = getEntitiesByGuidsQuery({ entityGuids });
    const {
      data: entityData,
      errors: entityErrors
    } = await NerdGraphQuery.query({
      query: entityQuery,
      variables
    });
    if (entityErrors) {
      console.debug("Return error for query", entityQuery);
      return { errors: entityErrors };
    }

    // STEP 6: Reduce both down to ordered lists
    let entities = [];
    let recentAlertViolations = [];
    // reduce entities from the workloadQueryX and entityQueryX
    const { actor } = entityData;
    if (actor) {
      Object.keys(actor).forEach(query => {
        // first, the entityQueryX queries
        if (query.startsWith('query')) {
          entities = [...entities, ...actor[query]];
        }
      });
    }
    entities = entities.sort(sortEntitiesByAlertSeverity);
    // console.debug(entities);
    // debugger;
    // reduce recentAlertViolations
    entities.forEach(entity => {
      if (
        entity.recentAlertViolations &&
        entity.recentAlertViolations.length > 0
      ) {
        recentAlertViolations = [
          ...recentAlertViolations,
          ...entity.recentAlertViolations
        ];
      }
    });
    recentAlertViolations.sort(sortAlertViolations);
    return { recentAlertViolations, entities };
  }

  static propTypes = {
    children: PropTypes.func,
    mapLocation: PropTypes.object,
    begin_time: PropTypes.number,
    end_time: PropTypes.number
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      recentAlertViolations: null,
      entities: null,
      errors: null
    };
  }

  async componentDidMount() {
    this.load({ resetState: false });
  }

  async componentDidUpdate(prevProps) {
    if (
      prevProps.mapLocation &&
      this.props.mapLocation &&
      prevProps.mapLocation.guid !== this.props.mapLocation.guid
    ) {
      // console.debug("MapQuery.componentDidUpdate map.guid changed", [prevProps, this.props]);
      this.load({ resetFlag: true });
    } else if (
      (prevProps.begin_time &&
        this.props.begin_time &&
        prevProps.begin_time !== this.props.begin_time) ||
      (prevProps.end_time &&
        this.props.end_time &&
        prevProps.end_time !== this.props.end_time)
    ) {
      // console.debug("MapQuery.componentDidUpdate time window changed", [prevProps, this.props]);
      this.load({ resetFlag: false });
    }
  }

  async load({ resetFlag = false }) {
    const { mapLocation } = this.props;
    if (resetFlag) {
      this.setState({
        loading: true,
        recentAlertViolations: null,
        entities: null
      });
    }
    const {
      entities,
      recentAlertViolations,
      errors
    } = await DetailPanelQuery.query({ mapLocation });
    this.setState({
      loading: false,
      errors,
      recentAlertViolations,
      entities
    });
  }

  render() {
    const { children } = this.props;
    const { loading, recentAlertViolations, entities, errors } = this.state;
    return children({ loading, recentAlertViolations, entities, errors });
  }
}
