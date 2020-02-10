/*
 * Copyright 2019 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
/* {
  id: 0,
  status: "red",
  favorite: false,
  storeId: 6634547845,
  lastIncident: "30 sec. ago",
  state: "MD"
},*/
import { NerdGraphQuery } from 'nr1';
import geoopsConfig from '../../geoopsConfig';
import gql from 'graphql-tag';
// import sprintf from 'sprintf-js';

/**
 * This is where the magic happens. See the logic in the start method.
 * We're merging the data between the geoopsConfig, which contains our lat/lng as well as metadata
 * alongside, alertStatus and lastIncident data from an entity NerdGraph query.
 */
export default class Data {
  constructor(options) {
    this.options = options;
    this.refreshState = true;
    this.timeout = null;
    this.start();
  }

  pause() {
    this.refreshState = false;
  }

  stop() {
    this.refreshState = false;
    clearTimeout(this.timeout);
  }

  /**
   * Logic:
   * - lookup all the locationId values for the selected config
   * - also, lookup the entities and joins in the config
   * - start with INFRA HOST
   * - foreach other entities
   *   - lookup the join.associationTypes
   *   - if we find an associationType(s) of relationships, lookup
   */
  start() {
    const { refreshTimeout, callbacks } = this.options;
    clearTimeout(this.timeout);
    this._refreshData().then(({ data, favorites }) => {
      if (this.refreshState) {
        callbacks.setData(data, favorites);
      }
      // console.debug(`Calling setTimeout for ${refreshTimeout}`);
      this.timeout = setTimeout(() => {
        this.start();
      }, refreshTimeout);
    });
  }

  _entityAndAlertGql(entityGuids) {
    const query = `{
      actor {
        nerdStorage {
          document(collection: "v0-infra-geoops", documentId: "favorites")
        }
        entities(guids: [${entityGuids.map(guid => `"${guid}"`)}]) {
          domain
          guid
          name
          type
          ... on AlertableEntity {
            alertSeverity
            recentAlertViolations(count: 1) {
              alertSeverity
              level
              openedAt
              closedAt
              violationUrl
            }
          }
          accountId
        }
      }
    }`;
    // console.debug(query);
    return query;
  }

  _refreshData() {
    return new Promise(resolve => {
      const { configId, demoMode } = this.options;
      const config = geoopsConfig.find(c => c.id === configId);
      // console.debug(config);
      const entityGuids = demoMode
        ? this._demoModeGuids(config)
        : this._joinLogicGuids(config);
      // console.debug(entityGuids);
      NerdGraphQuery.query({
        query: gql`
          ${this._entityAndAlertGql(entityGuids)}
        `
      }).then(({ data }) => {
        const favorites = data.actor.nerdStorage.document
          ? data.actor.nerdStorage.document.favorites
          : [];
        const points = [];

        if (config && config.locations) {
          config.locations.forEach(l => {
            const point = { ...l };
            point.entities = this._resolveEntities(point, data);
            point.status = this._rollupStatus(point);
            point.statusColor = point.status.color;
            point.lastIncident = this._rollupLastIncident(point);
            point.lastIncidentTimestamp = point.lastIncident
              ? point.lastIncident.openedAt
              : 0;
            point.favorite =
              favorites && favorites.find(favorite => favorite === point.id);
            if (!point.favorite) {
              point.favorite = false;
            }
            points.push(point);
          });
        }

        resolve({
          data: points.sort((a, b) => {
            // eslint-disable-next-line no-nested-ternary
            return a.favorite ? 1 : b.favorite ? -1 : 0;
          }),
          favorites
        });
      });
    });
  }

  _resolveEntities(point, dataSet) {
    const { demoMode } = this.options;
    if (demoMode) {
      const keys = Object.keys(point.demoMode);
      let entityGuids = [];
      keys.forEach(k => {
        const guids = point.demoMode[k];
        if (guids) {
          entityGuids = entityGuids.concat(guids);
        }
      });
      return dataSet.actor.entities.filter(entity =>
        entityGuids.includes(entity.guid)
      );
    } else {
      return [];
    }
  }

  _rollupLastIncident(point) {
    let mostRecentIncident = null;
    if (point.entities) {
      point.entities.forEach(entity => {
        if (!mostRecentIncident && entity.recentAlertViolations.length > 0) {
          mostRecentIncident = entity.recentAlertViolations[0];
        } else if (entity.recentAlertViolations.length > 0) {
          mostRecentIncident =
            mostRecentIncident.openedAt >
            entity.recentAlertViolations[0].openedAt
              ? mostRecentIncident
              : entity.recentAlertViolations[0];
        }
      });
    }
    return mostRecentIncident;
  }

  _rollupStatus(point) {
    if (!point.entities || point.entities.length === 0) {
      return {
        color: 'grey',
        status: 0
      };
    }
    const obj = {
      CRITICAL: point.entities.filter(e => e.alertSeverity === 'CRITICAL'),
      WARNING: point.entities.filter(e => e.alertSeverity === 'WARNING'),
      NOT_ALERTING: point.entities.filter(
        e => e.alertSeverity === 'NOT_ALERTING'
      )
    };
    if (obj.CRITICAL && obj.CRITICAL.length > 1) {
      return {
        color: 'darkred',
        status: 4
      };
    } else if (obj.CRITICAL && obj.CRITICAL.length > 0) {
      return {
        color: 'red',
        status: 3
      };
    } else if (obj.WARNING && obj.WARNING.length > 0) {
      return {
        color: 'yellow',
        status: 2
      };
    } else {
      return {
        color: 'green',
        status: 1
      };
    }
  }

  /**
   * Return one array of guids from the various demoMode attributes.
   * @param {Object} config
   */
  _demoModeGuids(config) {
    let guids = [];

    if (!config || !config.locations) {
      return guids;
    }

    config.locations.forEach(l => {
      const keys = Object.keys(l.demoMode);
      keys.forEach(k => {
        if (l.demoMode[k] != null) {
          guids = guids.concat(l.demoMode[k]);
        }
      });
    });
    return guids;
  }

  /**
   * WIP
   */
  _joinLogicGuids(config) {
    // eslint-disable-next-line no-unused-vars
    const locationIds = config.locations.map(l => l.locationId);
    // eslint-disable-next-line no-unused-vars
    const { joins, additionalEntityTypes } = config;
  }
}
