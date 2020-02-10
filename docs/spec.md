# Infra Geo Ops, a.k.a. Geographic Point of Sale

The objective is to enable businesses to observe the performance of any collected data/metrics at a given physical location. This requires a few extensions to platform features:

- The ability to associate an Entity or list of Entities with a physical lat/lng
- To flexibly define the performance goals for a given location
- Aggregation/display of physical locations on a map with drilldown capabilities into the Location and corresponding entity(ies)

## Data Structures

### Map

```json
{
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
      "minimum": -90,
      "maximum": 90
    },
    "centerLng": {
      "type": "number",
      "minimum": -180,
      "maximum": 180
    },
    "zoom": {
      "type": "number",
      "minimum": 0,
      "maximum": 12
    }
  }
}
```

### Location

```json
{
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
}
```

### MapLocation

A MapLocation is the core object in this application and has the following data structure:

Note: Should be flexible enough long-term to allow for any Entity, initially we'll focus on Workloads

```json
{
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
}
```

We have two approaches for storing this information:

1. EntityStorage - with pointers to the related entity(ies)
1. EntityTags

EntityStorage has a higher capacity for storing complex information associated with a MapLocation, however there may be _some_ benefit to storing a lat/lng/address as a Tag on a given Entity.

## Regions

Some discussion around making regions their own object for the purposes of rendering a map by region.

## User Workflow

1. (optional) - [Define a Workload](https://one.newrelic.com/launcher/workloads.home)
1. Create a Map
1. Define Locations
    - Upload a file - link to a document with acceptable format
    - Define points manually
        - Provide an address, lat/lng, or choose from the map
1. Define the `MapLocation` object/marker:
    1. Select a MapLocation
    1. Choose a Workload or Entity to associate with this MapLocation
    1. Provide a NRQL query to drive the data point around this Location
    1. Save

Notes:

- As part of defining/uploading locations we automatically add them to _this_ map. This means we could offer a separate interface for managing _all_ locations vs. managing _this_ map's locations.
- `MapLocation` Marker color will be determined by asking for all entities for a given `MapLocation` and seeing if any of them have a status of Alerting

## Populating the map

Requesting data for a given map would look like:

1. `await getMaps({ accountId })` from `AccountStorage`
1. `await getMap({ mapGuid })` from `AccountStorage`
1. `await getMapLocations({ mapGuid })` from `AccountStorage`
1. `const entities = await getMapEntities({ mapLocationList })` is passed a list of objects containing `entityGuid` and `entityType` by reducing the results of `getMapLocations`
1. Two calls, one for fetching Workloads and one for fetching Entities
  a. `const workloads = await getWorkloads({ workloadIds })`
  b. `const entities = await getEntities({ entityGuids })`
1. Either create a HashMap keyed by `entityGuid` or loop through the map's `MapLocations` and merge the resulting Entity/Workload data with the `MapLocation`
1. Render each `MapLocation` on the map. Including the user-defined calculation for determining the health of a given location.

## Outstanding Considerations

1. Workloads are not as "account bound" as Nerdpacks
