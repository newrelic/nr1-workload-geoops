# Infra Geo Ops, a.k.a. Geographic Point of Sale

> nr1-infra-geoops provides a geographic exploration of Infrastructure and APM data tied to a point of sale solution.

The objective is to enable businesses to observe the performance of any collected data/metrics at a given physical location. This requires a few extensions to platform features:

- The ability to associate an Entity or list of Entities with a physical lat/lng
- To flexibly define the performance goals for a given location
- Drilldown/detail capabilities of the corresponding entity(ies) for a given physical lat/lng

## Workloads

The new Workloads feature in NewRelic seem to be a natural fit for the groupings of entities we're trying to achieve at a given physical location.

<!-- TO DO - Additional documentation links to Workloads etc. -->

## UI

### Designs

[Figma](https://www.figma.com/file/teuKpmtKdyo0xF0KBVrmU0/Infra-Geo-Ops)

### React JSON Schema Form

[React Json Schema Form](https://github.com/rjsf-team/react-jsonschema-form)  
[Modify Schema for Dropdowns](https://github.com/rjsf-team/react-jsonschema-form/issues/809)  
[Multiple Choice List](https://react-jsonschema-form.readthedocs.io/en/latest/form-customization/#multiple-choice-list)

### Geographic View

[React Leaflet](https://react-leaflet.js.org/)

## Data Structures

### Map

```json
{
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
      "minimum": -90,
      "maximum": 90
    },
    "centerLng": {
      "type": "number",
      "title": "Center Point Longitude",
      "minimum": -180,
      "maximum": 180
    },
    "zoom": {
      "type": "number",
      "title": "Default Zoom Level",
      "minimum": 0,
      "maximum": 12
    }
  }
```

### Location

```json
{
  "description": "Location",
  "type": "object",
  "required": [],
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
    },
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
}
```

### MapLocation

A MapLocation is the core object in this application and has the following data structure:

Note: Should be flexible enough long-term to allow for any Entity, initially we'll focus on Workloads

```json
{
  "description": "Map",
  "type": "object",
  "required": [],
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
    },
    "location": {
      "type": "string",
      "title": "Location",
    },
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
    }
  }
}
```

We have two approaches for storing Location information:

1. EntityStorage - with pointers to the related entity(ies)
1. EntityTags

EntityStorage has a higher capacity for storing complex information associated with a MapLocation, however there may be _some_ benefit to storing a lat/lng/address as a Tag on a given Entity.

### Regions

Some discussion around making regions their own object for the purposes of rendering a map by region. Should be able to derive from `Location` or `MapLocation` data.

## Relating Data

The current plan is to store `uuid` pointers on the `MapLocation` object for:

- `Map`
- `Location`
- `RelatedEntities` - workloads (v1) and any other entities (v2)

[react-jsonschema-form](https://github.com/rjsf-team/react-jsonschema-form) doesn't handle this well...
[Dynamically modifying the schema to provide dropdown options seems to be the only way to achieve this functionality](https://github.com/rjsf-team/react-jsonschema-form/issues/809) by setting:
> "enum": [ array of values ]
> "enumNames": [ array of labels]

We could proceed with using react-jsonschema-form or we could roll our own [UI components/schema](https://react-jsonschema-form.readthedocs.io/en/latest/form-customization/#the-uischema-object) to use with react-jsonschema-form

## User Workflows

### Pre-requisites

1. (optional) - [Define Workloads](https://one.newrelic.com/launcher/workloads.home)

### 1. Getting Started

1. Create a Map
1. Define Locations
    - Upload a file - link to a document with acceptable format
    - Define points manually
        - Provide an address, lat/lng, or choose from the map
1. Define the `MapLocation` object/marker:
    1. Select a MapLocation
    1. Choose Workloads and/or Entities to associate with this MapLocation
    1. Provide a NRQL query to drive the data point for this Location
    1. Save

### 2. View Map

1. Select a Map
1. Set data refresh interval
1. Zoom in/out
1. Filter `MapLocations` by location data. Search-term/Region/Municipality/Country etc.
1. Filter `MapLocations` by Status
1. View Details of a `MapLocation`
    1. Workload/Entity links and metadata
    1. Events timeline of given Workload/Entities
    1. Chart of aggregate measure (NRQL/Overall Revenue, etc.)

### 3. Edit Map

1. Select a Map
1. Edit map metadata like centerPoint and title etc.
1. Edit a specific `MapLocation`

Notes:

- As part of defining/uploading locations we automatically add them to _this_ map. This means we could offer a separate interface for managing _all_ locations vs. managing _this_ map's locations.
- `MapLocation` Marker color will be determined by asking for all entities for a given `MapLocation` and seeing if any of them have a status of Alerting

## Populating the map

Requesting data for a given map would look like:

1. User would select a map - `await getMaps({ accountId })` from `AccountStorage`
1. `await getMap({ mapGuid })` from `AccountStorage`
1. `await getMapLocations({ mapGuid })` from `AccountStorage`
1. `const entities = await getMapEntities({ mapLocationList })` is passed a list of objects containing `entityGuid` and `entityType` by reducing the results of `getMapLocations`
1. Two calls, one for fetching Workloads and one for fetching Entities
  a. `const workloads = await getWorkloads({ workloadIds })` and then `const entities = await getEntities({ workloadEntityGuids })`
  b. `const entities = await getEntities({ entityGuids })`
1. Either create a HashMap keyed by `entityGuid` or loop through the map's `MapLocations` and merge the resulting Entity/Workload data with the `MapLocation`
1. Derive marker color from associated Alerting entities. *Workloads will eventually have an alerting status, for now we must look at the Entities inside of a workload.
1. Render each `MapLocation` on the map.
1. Queue/batch and start processing the NRQL tied to each `MapLocation`
1. Render/update each `MapLocation` with the result of the NRQL and a timestamp
1. Reprocess NRQL at a given interval/rate

## Potential Issues

1. Workloads are not as "account bound" as Nerdpacks
1. Storing "Locations" as their own collection, decoupled from the "Map" and "MapLocation" objects. Most problematic when it comes to "deleting" a location. Do we actually delete it? Or just hide it and retain it for references in other Map objects (and warn about outdated location)? Embedding them would make them transport better but cause issues if we wanted to developed any kind of automated way of keep an organizations locations data in-sync with maps.
1. Where should the list of options for Municipality/Region/Country come from? Account-level defined locations, or exclusively those contained in that map's `MapLocation`'s
1. Functionality/admin screens outside of our currently designed "Getting Started" workflow
    1. Add/Edit Account Locations (not Map specific)
    1. Add/Edit Maps (i.e. you've already "started", how do you manage maps that exist)
