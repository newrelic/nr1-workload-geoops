import React from 'react';
import PropTypes from 'prop-types';

import some from 'lodash.some';
import { format } from 'date-fns';

export default class MapLocationDistiller extends React.PureComponent {
  static propTypes = {
    children: PropTypes.func,
    mapLocations: PropTypes.array,
    entities: PropTypes.object,
    entityToEntitiesLookup: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      //
    };
  }

  severityStatusToWeight(value) {
    const values = {
      CRITICAL: 1,
      WARNING: 2,
      NOT_ALERTING: 3,
      NOT_CONFIGURED: 4
    };

    return values[value] || 5;
  }

  weightToSeverityStatus(value) {
    const values = {
      1: 'CRITICAL',
      2: 'WARNING',
      3: 'NOT_ALERTING',
      4: 'NOT_CONFIGURED'
    };

    return values[value] || '';
  }

  /*
   * Look for the highest weighted value on all associated entities
   */
  entityReducer(mapLocation) {
    const { entities, entityToEntitiesLookup } = this.props;
    const mapLocationEntities = mapLocation.entities || [];
    let mostCriticalEntity;

    if (mapLocationEntities.length > 0) {
      // TO DO
      // Does 'some' convert the object to an array first? If so, we should find a more performant way to check for values
      // Maybe we don't pass the mapped entities down and just an array
      // and we let this component build the map
      if (some(mapLocationEntities)) {
        mostCriticalEntity = mapLocationEntities.reduce(
          (p, { guid: entityGuid }) => {
            const entity = entities[entityGuid];
            const relatedEntities = entityToEntitiesLookup[entityGuid] || [];

            const entitiesToDistill = [
              entity,
              ...relatedEntities.map(guid => entities[guid])
            ];
            const distill = (previousValue, { guid: entityGuid }) => {
              if (entityGuid) {
                const entity = entities[entityGuid];
                if (entity) {
                  if (!previousValue) {
                    return entity;
                  }

                  const status = entity.alertSeverity || ''; // Only exists on alertable entities
                  const current = this.severityStatusToWeight(status);
                  const previous = this.severityStatusToWeight(
                    previousValue.alertSeverity
                  );

                  if (current < previous) {
                    return entity;
                  }
                }
              }
              return previousValue;
            };

            return entitiesToDistill.reduce(distill, p);
          },
          null
        );

        if (mostCriticalEntity) {
          return mostCriticalEntity;
        }
      }
    }
    return null;
  }

  transformMapLocations() {
    const { mapLocations = [] } = this.props;

    return mapLocations.reduce((previousValue, ml) => {
      const { document } = ml;

      if (!document.guid) {
        console.warn('Map Location missing guid');
        console.debug(document);
        return previousValue;
      }

      // Last incident is actually the entity that has the current worst alertSeverity
      const mostCriticalEntity = this.entityReducer(document);
      const mostRecentAlertViolation = mostCriticalEntity.alertViolations[0];
      const lastIncidentTime = mostRecentAlertViolation
        ? format(
            new Date(mostRecentAlertViolation.openedAt),
            'MMM i, hh:mm:ss aaaa'
          )
        : 'N/A';

      previousValue.push({
        ...document,
        favorite: false,
        mostCriticalEntity,
        lastIncidentTime
      });

      return previousValue;
    }, []);
  }

  render() {
    const { children } = this.props;
    const data = this.transformMapLocations();

    return children({ data });
  }
}
