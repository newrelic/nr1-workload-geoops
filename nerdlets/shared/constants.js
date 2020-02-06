/*
 * ESLint/Prettier customization for easy copy/paste of the schema into
 * - react-jsonschema-form's playground https://rjsf-team.github.io/react-jsonschema-form/
 * - https://json-schema-faker.js.org/#
 */

/* eslint-disable prettier/prettier */
/* eslint quote-props: ["error", "always"]*/
/* eslint quotes: ["error", "double"]*/

import uuid from "uuid";

export const MAP_COLLECTION_ID = "v1-maps-collection";
export const MAP_LOCATION_COLLECTION_ID = "v1-map-location-collection";
export const MAP_LOCATION_METRIC_COLLECTION_ID = "v1-map-location-metric";
export const mapLocationCollection = ({ mapGuid }) => `${MAP_LOCATION_COLLECTION_ID}-${mapGuid}`;

export const MAP_JSON_SCHEMA = {
  "id": "map",
  "description": "Map",
  "type": "object",
  "required": ["guid"],
  "properties": {
    "guid": {
      "type": "string"
    },
    "title": {
      "type": "string"
    },
    "centerLat": {
      "type": "number",

      // World
      // "minimum": -90,
      // "maximum": 90

      // USA
      "minimum": 19.50139,
      "maximum": 64.85694
    },
    "centerLng": {
      "type": "number",

      // World
      // "minimum": -180,
      // "maximum": 180

      // USA
      "minimum": -161.75583,
      "maximum": -68.01197
    },
    "zoom": {
      "type": "number",
      "minimum": 0,
      "maximum": 12
    }
  }
};

export const MAP_DEFAULTS = () => ({
  "guid": uuid()
});

export const LOCATION_JSON_SCHEMA = {
  "description": "Location",
  "type": "object",
  "required": ["guid"],
  "properties": {
    "guid": {
      "type": "string"
    },
    "title": {
      "type": "string"
    },
    "lat": {
      "type": "string"
    },
    "lng": {
      "type": "string"
    },
    "municipality": {
      "type": "string"
    },
    "region": {
      "type": "string"
    },
    "country": {
      "type": "string"
    },
    "postalCode": {
      "type": "string"
    }
  }
};

export const MAP_LOCATION_JSON_SCHEMA = {
  "description": "Map",
  "type": "object",
  "required": ["guid"],
  "properties": {
    "guid": {
      "type": "string"
    },
    "title": {
      "type": "string"
    },
    "mapGuid": {
      "type": "string"
    },
    "query": {
      "type": "string"
    },
    "entities": {
      "type": "array",
      "title": "Related Entities",
      "items": {
        "type": "object",
        "properties": {
          "guid": {
            "type": "string"
          },
          "entityType": {
            "type": "string"
          }
        }
      }
    }
  }
};