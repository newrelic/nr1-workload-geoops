/*
 * ESLint/Prettier customization for easy copy/paste of the schema into
 * - react-jsonschema-form's playground https://rjsf-team.github.io/react-jsonschema-form/
 * - https://json-schema-faker.js.org/#
 */

/* eslint-disable prettier/prettier */
/* eslint quote-props: ["error", "always"]*/
/* eslint quotes: ["error", "double"]*/

import cloneDeep from "lodash.clonedeep";
import uuid from "uuid/v4";
import { FormInputFullWidth, FormInputTwoColumn, FormInputThreeColumn } from "./components/react-jsonschema-form"

/*
 * TO DO - interrogate the need to use the UUID at all

 Documentation states:

 > Id of the nerdlet. You can specify the full nerdlet id: <nerdpack-id>.<nerdlet-id> (i.e. "8ba28fe4-5362-4f7f-8f9a-4b8c6c39d8a6.my-nerdlet") or simply <nerdlet-id> (i.e. "my-nerdlet"). In the latter case, the nerdlet will be treated as if it belongs to the current nerdpack, meaning that the nerdpack id is automatically added by the platform.

 Which leads me to believe we wouldn't need to specify the UUID, but we seemingly do.
*/

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

/**
 * A curious edge on this app is the reload of the launcher with an navigation.openLauncher call. To make that call, we need the uuid of the package.
 */
export const PACKAGE_UUID = "9b6e52b6-4bf8-4982-acd3-0b6e74373649";
export const MAP_COLLECTION_ID = "v1-maps-collection";
export const LOCATION_COLLECTION_ID = "v1-locations-collection";
export const MAP_LOCATION_COLLECTION_ID = "v1-map-location-collection";
export const mapLocationCollection = ({ mapGuid }) => `${MAP_LOCATION_COLLECTION_ID}-${mapGuid}`;

export const MAP_UI_SCHEMA = {
  "guid": { "ui:widget": "hidden" },
  "title": { "ui:FieldTemplate": FormInputTwoColumn },
  "accountId": { "ui:FieldTemplate": FormInputTwoColumn },
  "description": { "ui:FieldTemplate": FormInputFullWidth },
  "lat": { "ui:FieldTemplate": FormInputThreeColumn },
  "lng": { "ui:FieldTemplate": FormInputThreeColumn },
  "zoom": { "ui:FieldTemplate": FormInputThreeColumn },
  "runbookUrl": { "ui:FieldTemplate": FormInputTwoColumn },
  "contactEmail": { "ui:FieldTemplate": FormInputTwoColumn },
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
      "title": "Name your map"
    },
    "accountId": {
      "type": "number",
      "title": "Choose an account"
    },
    "description": {
      "type": "string",
      "title": "Description",
    },
    ...cloneDeep(LAT_LNG_SCHEMA),
    "zoom": {
      "type": "number",
      "title": "Default Zoom Level",
      "default": 4,
      "minimum": 0,
      "maximum": 12
    },
    "runbookUrl": {
      "type": "string",
      "title": "Runbook Link"
    },
    "contactEmail": {
      "type": "string",
      "title": "Contact Email"
    }
  }
};

export const MAP_DEFAULTS = () => ({
  "guid": uuid()
});

export const LOCATION_UI_SCHEMA = {
  "guid": { "ui:widget": "hidden" },
  "title": { "ui:FieldTemplate": FormInputFullWidth },
  "description": { "ui:FieldTemplate": FormInputFullWidth },
  "lat": { "ui:FieldTemplate": FormInputThreeColumn },
  "lng": { "ui:FieldTemplate": FormInputThreeColumn },
  "municipality": { "ui:FieldTemplate": FormInputThreeColumn },
  "region": { "ui:FieldTemplate": FormInputThreeColumn },
  "country": { "ui:FieldTemplate": FormInputThreeColumn },
  "postalCode": { "ui:FieldTemplate": FormInputThreeColumn },
  "runbookUrl": { "ui:FieldTemplate": FormInputTwoColumn },
  "contactEmail": { "ui:FieldTemplate": FormInputTwoColumn },
}

export const LOCATION_JSON_SCHEMA = {
  "description": "Location",
  "type": "object",
  "required": ["lat", "lng"],
  "properties": {
    "guid": {
      "type": "string"
    },
    "description": {
      "type": "string",
      "title": "Description"
    },
    ...cloneDeep(LAT_LNG_SCHEMA),
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

export const MAP_LOCATION_UI_SCHEMA = {
  "guid": { "ui:widget": "hidden" },
  "externalId": { "ui:widget": "hidden" },
  "title": { "ui:FieldTemplate": FormInputTwoColumn },
  "map": { "ui:FieldTemplate": FormInputTwoColumn },
  "location": {...LOCATION_UI_SCHEMA}
  // "entities": { "ui:field": "entities" }
}

export const MAP_LOCATION_DEFAULTS = () => ({
  "guid": uuid()
});

export const DEFINE_LOCATIONS_UI_SCHEMA = {
  "guid": { "ui:widget": "hidden" },
  "externalId": { "ui:widget": "hidden" },
  "title": { "ui:FieldTemplate": FormInputFullWidth },
  "map": { "ui:FieldTemplate": FormInputTwoColumn },
  "location": {...LOCATION_UI_SCHEMA}
  // "entities": { "ui:field": "entities" }
}

export const MAP_LOCATION_JSON_SCHEMA = {
  "description": "Map",
  "type": "object",
  "required": ["guid", "title", "map", "location"],
  "properties": {
    "guid": {
      "type": "string"
    },
    "externalId": {
      "type": ["string", "number"]
    },
    "title": {
      "type": "string",
      "title": "Title"
    },
    "map": {
      "type": "string",
      "title": "Map",
    },
    "location": {...cloneDeep(LOCATION_JSON_SCHEMA)},
    "query": {
      "type": "string",
      "title": "NRQL"
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
      },
    },
    "runbookUrl": {
      "type": "string",
      "title": "Runbook Link"
    },
    "contactEmail": {
      "type": "string",
      "title": "Contact Email"
    }
  }
};