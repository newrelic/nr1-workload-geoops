import React from 'react';
import PropTypes from 'prop-types';
import MapLocationQuery from './MapLocationQuery';
import MapLocationEntityQuery from './MapLocationEntityQuery';
import {
  weightToAlertSeverity,
  sortEntitiesByAlertSeverity
} from '../../../shared/utils';

/**
 * Object intentionally implements a declarative model in order to improve the efficiency of rendering maps, which are a collection of:
 * - Step 1: Retrieve the mapLocations for this map from Account-scoped NerdStorage
 * - Step 2: Retrieve the associated Entities (most likely Workloads, but it could involve descrete entities) and:
 *   - their alerting Status
 *   - the openViolations for those entities
 * - Step 3: Distill
 *   - the alerting Status for the Entities per mapLocation
 *   - the most urgent open violation (if any) for a mapLocation
 */
export default class MapQuery extends React.PureComponent {

 /**
  * Distill the `mostCriticalEntity` (including a list of `alertViolations`) for each `mapLocation`
  * @param {Array} mapLocations
  * @param {Array} entities
  * @returns {Array} of mapLocations, each with a `mostCriticalEntity` attribute
  */
 static _distillMostCriticalEntity(mapLocations, entities) {
   // console.debug("mapLocations", mapLocations);
   return mapLocations.map(mapLocation => {
     mapLocation.orderedEntities = entities
       .filter(entity => {
         return (
           mapLocation.entities &&
           mapLocation.entities.find(e => e.guid === entity.guid)
         );
       })
       .sort(sortEntitiesByAlertSeverity);
     mapLocation.mostCriticalEntity = mapLocation.orderedEntities
       ? mapLocation.orderedEntities[0]
       : null;
     mapLocation.mostCriticalEntity.alertSeverityWeight = weightToAlertSeverity(
       mapLocation.mostCriticalEntity.alertSeverity
     );
     mapLocation.entities = mapLocation.orderedEntities;
     return mapLocation;
   });
  }

  static async query({ map, begin_time, end_time }) {
    // STEP 1: Locations retrieved from Account-scoped NerdStorage
    const { mapLocations, entityGuids, errors: mapLocationErrors } = await MapLocationQuery.query({
      map
    });
    // console.debug("entityGuids", { mapLocations, entityGuids } );
    if (mapLocationErrors) {
      return { errors: mapLocationErrors };
    }
    if (!mapLocations || !entityGuids || entityGuids.length === 0) {
      // if we have no entities or no locations
      return {
        errors: null,
        mapLocations,
        hasEntities: entityGuids && entityGuids.length > 0
      };
    }

    // STEP 2: Entities, alerting status, and alert violations for each entity in the mapLocations
    const { entities, errors: mapLocationEntityErrors } = await MapLocationEntityQuery.query({
      begin_time,
      end_time,
      entityGuids
    });

    if (mapLocationEntityErrors) {
      return {
        errors: mapLocationEntityErrors
      }
    }

    // STEP 3: distill the most critical entity into a new attribute
    return {
      errors: null,
      mapLocations: MapQuery._distillMostCriticalEntity(mapLocations, entities),
      hasEntities: true
    }
  }

  static propTypes = {
    map: PropTypes.object,
    begin_time: PropTypes.number,
    end_time: PropTypes.number,
    children: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      errors: null,
      mapLocations: null,
      hasEntities: false
    };
  }

  async componentDidMount() {
    this.load({ resetFlag: false });
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
    if (resetFlag) {
      this.setState({
        loading: true,
        errors: null,
        mapLocations: null,
        hasEntities: false
      });
    }
    const { map, begin_time, end_time } = this.props;

    const { errors, mapLocations, hasEntities } = await MapQuery.query({ map, begin_time, end_time });
    this.setState({
      loading: false,
      errors,
      mapLocations,
      hasEntities
    });
  }

  render() {
    const { loading, errors, mapLocations, hasEntities } = this.state;
    const { children } = this.props;
    return children({
      loading,
      errors,
      mapLocations,
      hasEntities
    });
  }
}
