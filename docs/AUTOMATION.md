# Automation

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Overview](#overview)
  - [Workloads](#workloads)
  - [New Relic CLI](#new-relic-cli)
- [Automation and Integration](#automation-and-integration)
  - [Scripting data for Workload Geoops](#scripting-data-for-workload-geoops)
  - [Pre-requisites](#pre-requisites)
  - [Instructions](#instructions)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Overview

[Workload Geo-ops](https://github.com/newrelic/nr1-workload-geoops) is an example of [a highly customized application on New Relic One](https://developer.newrelic.com/) that helps you tailor to specific business needs. See your global [Workloads](https://docs.newrelic.com/docs/new-relic-one/use-new-relic-one/core-concepts/new-relic-one-workloads-isolate-resolve-incidents-faster) and link them to physical locations for quick identification and resolution of incidents.

Automating the population of this data from your CI/CD pipeline or business integration services provides an up-to-date view of how your software impacts and interacts with your physical locations.

### Workloads

> In New Relic, a workload represents a group of entities that work together to provide a digital service.

For more information on [Workloads](https://docs.newrelic.com/docs/new-relic-one/use-new-relic-one/core-concepts/new-relic-one-workloads-isolate-resolve-incidents-faster) visit [here](https://docs.newrelic.com/docs/new-relic-one/use-new-relic-one/core-concepts/new-relic-one-workloads-isolate-resolve-incidents-faster)

### New Relic CLI

The New Relic CLI is an officially supported command line interface for New Relic, released as part of the [Developer Toolkit](https://newrelic.github.io/developer-toolkit/).

## Automation and Integration

Workload Geoops provides 2 ways to setup data:

1. A step-by-step wizard in the application to assist you in defining `MapLocation`'s on a map by map basis
2. A JSON file upload in the application of `MapLocations` for a specific `Map`

These data objects are written to and read out of [Nerd Storage](https://developer.newrelic.com/build-tools/new-relic-one-applications/nerdstorage) by the application. Both of these are convenient and user-friendly but are unable to automate or script the data for you.

We teamed up with our [Developer Toolkit](https://newrelic.github.io/developer-toolkit/) team and their newly [open-sourced New Relic CLI](https://github.com/newrelic/newrelic-cli) to provide a way to automate the input of this Geographic data into this application by inserting data directly into [Nerd Storage](https://developer.newrelic.com/build-tools/new-relic-one-applications/nerdstorage) in association with this specific application.

### Scripting data for Workload Geoops

This is a "how-to" on utilizing the [New Relic CLI](https://github.com/newrelic/newrelic-cli) to script data into [NerdStorage](https://developer.newrelic.com/build-tools/new-relic-one-applications/nerdstorage), providing an integration point and ability to overlay your data into applications built with New Relic One.

This will walk you through adding the prerequisite `Map` and `MapLocation` data to drive the Workload Geoops application. Visit our [Data Dictionary](./data-dictionary.md) for detailed information on the `Map` and `MapLocation` data objects.

### Pre-requisites

1. [Install the NewRelic CLI](https://github.com/newrelic/newrelic-cli)
1. Add a profile to the NewRelic CLI

 ```bash
  newrelic profile add --name fluffy-waffles --region US --apiKey <your api key>
 ```

1. Add an app/nerdpack to your account, either via deploying your own, or adding access through the _New Relic One Catalog_ app. See [publish and deploy](https://developer.newrelic.com/build-tools/new-relic-one-applications/publish-deploy) for more information.
1. Find the UUID (packageId) of the app/nerdpack - most easily derived from looking at the link to the launcher icon `https://one.newrelic.com/launcher/035a0597-d6a9-46a9-97e4-a8a4b3101f2a.geo-ops`, `035a0597-d6a9-46a9-97e4-a8a4b3101f2a` is the `packageId` or `uuid` of the app/nerdpack

### Instructions

1. Identify the New Relic `accountId` you're working with, most commonly this is a 7-digit number

1. Identify the application's `packageId` to write data to, this is a uuid, example - `035a0597-d6a9-46a9-97e4-a8a4b3101f2a`

1. Generate a uuid for uniquely identifying your map. In Javascript there is a package called [uuid](https://github.com/uuidjs/uuid), if you're just experimenting, you can use an [online generator](https://www.guidgenerator.com/)

1. Identify the collection and/or document in NerdStorage you need to write to  

    For nr1-workload-geoops, the collection keys are:

    | Document Name | Collection Namespace                  |   |   |   |
    |---------------|---------------------------------------|---|---|---|
    | Map           | v1-maps-collection                    |   |   |   |
    | MapLocation   | v1-map-location-collection-{map-uuid} |   |   |   |
    |               |                                       |   |   |   |

    More information on these can be found in the [data dictionary](./data-dictionary.md).

1. Generate/write/form your document(s)

    A single `Map` document:

    ```json
      {
        "guid": "836611b8-9d08-41c7-ac81-419ae2a1fd6c",
        "title": "Foo Map",
        "accountId": "2526305",
        "description": "My map description",
        "lat": "38.0000",
        "lng": "-97.0000",
        "zoom": "6",
        "runbookUrl": "https://docs.google.com/document/d/1NOWVNqJ9G8Ks5jIf2HVRj2CLP0Mjui1FsaIqs7kXy-Y/edit",
        "contactEmail": "foo@newrelic.com"
      }
    ```

    A single `MapLocation` document:

    ```json
      {
        "guid": "27983350-fa72-4924-b934-8d58a7a4bd80",
        "externalId": "399",
        "title": "600 Ikea Way",
        "location": {
          "municipality": "Burbank",
          "region": "CA",
          "country": "USA",
          "postalCode": "91502",
          "description": "Nulla quis tortor orci. Etiam at risus et justo dignissim.",
          "lat": "34.174558",
          "lng": "-118.303142"
        },
        "query": "FROM Transaction SELECT average(duration) FACET entityGuid, appName WHERE entityGuid in ('NjMwMDYwfEFQTXxBUFBMSUNBVElPTnw2MDgwNzg2')",
        "entities": [
          {
            "guid": "NjMwMDYwfE5SMXxXT1JLTE9BRHwzODI",
            "entityType": "WORKLOAD_ENTITY"
          }
        ],
        "contactEmail": "foo@foo.com",
        "runbookUrl": "https://docs.google.com/document/d/1NOWVNqJ9G8Ks5jIf2HVRj2CLP0Mjui1FsaIqs7kXy-Y/edit"
      }
    ```

    A JSON Schema specification of these objects/fields can be found in [constants.js](../nerdlets/shared/constants.js)

1. Execute the CLI command  
    1. Map

        ```bash
        newrelic nerdstorage document write \
        --scope ACCOUNT \
        --packageId 035a0597-d6a9-46a9-97e4-a8a4b3101f2a \
        --accountId 2526305 \
        --collection v1-maps-collection \
        --documentId <the guid of your map, in this case - 836611b8-9d08-41c7-ac81-419ae2a1fd6c> \
        --document '{
            "guid": "836611b8-9d08-41c7-ac81-419ae2a1fd6c",
            "title": "Foo Map",
            "accountId": "2526305",
            "description": "My map description",
            "lat": "38.0000",
            "lng": "-97.0000",
            "zoom": "6",
            "runbookUrl": "https://docs.google.com/document/d/1NOWVNqJ9G8Ks5jIf2HVRj2CLP0Mjui1FsaIqs7kXy-Y/edit",
            "contactEmail": "foo@newrelic.com"
          }'
        ```

    1. A single MapLocation (you will want multiple)

        `documentId` is a UUID you generate to uniquely represent the `MapLocation` object

        ```bash
        newrelic nerdstorage document write \
        --scope ACCOUNT \
        --packageId 035a0597-d6a9-46a9-97e4-a8a4b3101f2a \
        --accountId 2526305 \
        --collection v1-map-location-collection-836611b8-9d08-41c7-ac81-419ae2a1fd6c \
        --documentId <the guid of your maplocation, in this case 27983350-fa72-4924-b934-8d58a7a4bd80> \
        --document '{
            "guid": "27983350-fa72-4924-b934-8d58a7a4bd80",
            "externalId": "399",
            "title": "600 Ikea Way",
            "location": {
              "municipality": "Burbank",
              "region": "CA",
              "country": "USA",
              "postalCode": "91502",
              "description": "Nulla quis tortor orci. Etiam at risus et justo dignissim.",
              "lat": "34.174558",
              "lng": "-118.303142"
            },
            "query": "FROM Transaction SELECT average(duration) FACET entityGuid, appName WHERE entityGuid in ('NjMwMDYwfEFQTXxBUFBMSUNBVElPTnw2MDgwNzg2')",
            "entities": [
              {
                "guid": "NjMwMDYwfE5SMXxXT1JLTE9BRHwzODI",
                "entityType": "WORKLOAD_ENTITY"
              }
            ],
            "contactEmail": "foo@foo.com",
            "runbookUrl": "https://docs.google.com/document/d/1NOWVNqJ9G8Ks5jIf2HVRj2CLP0Mjui1FsaIqs7kXy-Y/edit"
          }'
        ```
