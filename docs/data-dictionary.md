# Data Dictionary

## Platform Data

### Workload

Workloads on [docs.newrelic.com](https://docs.newrelic.com/docs/new-relic-one/use-new-relic-one/core-concepts/new-relic-one-workloads-isolate-resolve-incidents-faster):

> In New Relic, a workload is represents a group of entities that work together to provide a digital service. New Relic One gives you the ability to group and > monitor entities based on a team or a set of responsibilities, from front-end to back-end services, across your entire stack.
>
> Workloads help you get understanding of a complex system, detect issues, understand the cause and impact of an incident, and resolve things quickly.

### Entity

"What is an entity?" on [docs.newrelic.com](https://docs.newrelic.com/docs/new-relic-one/use-new-relic-one/core-concepts/what-entity-new-relic)

> An entity is anything New Relic can identify that has data you can monitor.

## NerdStorage (document storage)

[NerdStorage Guide](https://developer.newrelic.com/build-tools/new-relic-one-applications/nerdstorage)

> NerdStorage is used to store and retrieve simple sets of data, including users' configuration settings and preferences (like favorites), or any other small data sets. This storage is unique per Nerdpack, and can't be shared with any other Nerdpack.

This application extends NerdStorage with two additional document collections, Map and MapLocation.

### Map

A map is the high-level data object representing a collection of points on a map. A map is associated with a specific account which drives the data access for that map.

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
}
```

### MapLocation

A `MapLocation` is a specific document in a collection which represents a point (or marker) on a map. Nested within each `MapLocation` is a `Location` object that is representative of the geographic data needed for rendering that point. Additional a `MapLocation` has some metadata for reporting (`query` and `entities`) on that `MapLocation` as well as some metadata for reaching out (`contactEmail`) and resolving issues (`runbookUrl`).

```json
{
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
    "location": <see below>,
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
}
```

### Location

A location object is nested inside of `MapLocation` as a child document and is specific to the geographic aspects of defining the `MapLocation`.

```json
{
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

## Notes

1. Workloads have a primary `accountId` as does our `Map` object, however a `Workload` can be comprised of entities from different accounts
