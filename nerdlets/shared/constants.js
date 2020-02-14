/*
 * ESLint/Prettier customization for easy copy/paste of the schema into
 * - react-jsonschema-form's playground https://rjsf-team.github.io/react-jsonschema-form/
 * - https://json-schema-faker.js.org/#
 */

/* eslint-disable prettier/prettier */
/* eslint quote-props: ["error", "always"]*/
/* eslint quotes: ["error", "double"]*/

import uuid from "uuid";

const LAT_LNG_SCHEMA = {
  "lat": {
    "type": "number",
      "title": "Latitude",
      "minimum": -90,
      "maximum": 90
  },
  "lng": {
    "type": "number",
      "title": "Longitude",
      "minimum": -180,
      "maximum": 180
  }
};

export const MAP_COLLECTION_ID = "v1-maps-collection";
export const LOCATION_COLLECTION_ID = "v1-locations-collection";
export const MAP_LOCATION_COLLECTION_ID = "v1-map-location-collection";
export const MAP_LOCATION_METRIC_COLLECTION_ID = "v1-map-location-metric";
export const mapLocationCollection = ({ mapGuid }) => `${MAP_LOCATION_COLLECTION_ID}-${mapGuid}`;

export const MAP_UI_SCHEMA = {
  "guid": { "ui:widget": "hidden" },
}

export const MAP_JSON_SCHEMA = {
  "id": "map",
  "description": "Map",
  "type": "object",
  "required": ["guid", "title"],
  "properties": {
    "guid": {
      "type": "string"
    },
    "title": {
      "type": "string",
      "title": "Title"
    },
    "description": {
      "type": "string",
      "title": "Description",
    },
    "centerLat": {
      "type": "number",
      "title": "Center Point Latitude",

      // World
      // "minimum": -90,
      // "maximum": 90

      // USA
      "minimum": 19.50139,
      "maximum": 64.85694
    },
    "centerLng": {
      "type": "number",
      "title": "Center Point Longitude",

      // World
      // "minimum": -180,
      // "maximum": 180

      // USA
      "minimum": -161.75583,
      "maximum": -68.01197
    },
    "zoom": {
      "type": "number",
      "title": "Default Zoom Level",
      "minimum": 0,
      "maximum": 12
    }
  }
};

export const MAP_DEFAULTS = () => ({
  "guid": uuid()
});

export const LOCATION_UI_SCHEMA = {
  "guid": { "ui:widget": "hidden" },
}

export const LOCATION_JSON_SCHEMA = {
  "description": "Location",
  "type": "object",
  "required": ["guid", "title", "lat", "lng"],
  "properties": {
    "guid": {
      "type": "string"
    },
    "title": {
      "type": "string",
      "title": "Title"
    },
    "description": {
      "type": "string",
      "title": "Description"
    },
    ...LAT_LNG_SCHEMA,
    "municipality": {
      "type": "string",
      "title": "Municipality"
    },
    "region": {
      "type": "string",
      "title": "Region"
    },
    "country": {
      "type": "string",
      "title": "Country"
    },
    "postalCode": {
      "type": "string",
      "title": "Postal Code"
    }
  }
};

export const LOCATION_DEFAULTS = () => ({
  "guid": uuid()
});

export const MAP_LOCATION_UI_SCHEMA = {
  "guid": { "ui:widget": "hidden" },
  "entities": { "ui:field": "entities" }
  // ,
  // "map": { "ui:widget": "select" }
}

export const MAP_LOCATION_JSON_SCHEMA = {
  "description": "Map",
  "type": "object",
  "required": ["guid", "title", "map", "location"],
  "properties": {
    "guid": {
      "type": "string"
    },
    "title": {
      "type": "string",
      "title": "Title"
    },
    "map": {
      "type": "string",
      "title": "Map",
      // Dynamically modifying the schema to provide dropdown options seems to be the only way to achieve this functionality
      // https://github.com/rjsf-team/react-jsonschema-form/issues/809
      // "enum": 
      // "enumNames":
    },
    "location": {
      "type": "string",
      "title": "Location",
      // Dynamically modifying the schema to provide dropdown options seems to be the only way to achieve this functionality
      // https://github.com/rjsf-team/react-jsonschema-form/issues/809
      // "enum": 
      // "enumNames":
    },
    "query": {
      "type": "string",
      "title": "NRQL"
    },
    // TO DO - https://react-jsonschema-form.readthedocs.io/en/latest/form-customization/#multiple-choice-list
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
      },
      // Dynamically modifying the schema to provide dropdown options seems to be the only way to achieve this functionality
      // https://github.com/rjsf-team/react-jsonschema-form/issues/809
      // "enum": 
      // "enumNames":
    }
  }
};