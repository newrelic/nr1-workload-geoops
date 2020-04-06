# Automation

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Automation](#automation)
  - [Overview](#overview)
  - [New Relic CLI](#new-relic-cli)
  - [Scripting Map and MapLocation data](#scripting-map-and-maplocation-data)
    - [Pre-requisites](#pre-requisites)
    - [Example 1 - Add a Map](#example-1---add-a-map)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Overview

[Build highly customized applications on New Relic One](https://developer.newrelic.com/) that meet your unique business needs combined with our [Developer Toolkit's](https://newrelic.github.io/developer-toolkit/) [Terraform provider](https://github.com/newrelic/terraform-newrelic-apm) and [NewRelic CLI](https://github.com/newrelic/newrelic-cli) projects.

## New Relic CLI

The New Relic CLI is an officially supported command line interface for New Relic, released as part of the [Developer Toolkit](https://newrelic.github.io/developer-toolkit/) and can be found [open-sourced on Github](https://github.com/newrelic/newrelic-cli).

## Scripting Map and MapLocation data

The New Relic CLI can be utilized to script data into [NerdStorage](https://developer.newrelic.com/build-tools/new-relic-one-applications/nerdstorage), providing an integration point and ability to overlay your data into applications built with New Relic One.

### Pre-requisites

1. [Install the NewRelic CLI](https://github.com/newrelic/newrelic-cli)
1. Add a profile to the NewRelic CLI

 ```bash
  newrelic-cli profile add --name fluffy-waffles --region US --apiKey <your api key>
 ```

1. Add an app/nerdpack to your account, either via deploying your own, or adding access through the _New Relic One Catalog_ app. See [publish and deploy](https://developer.newrelic.com/build-tools/new-relic-one-applications/publish-deploy) for more information.
1. Find the UUID of the app/nerdpack - most easily derived from looking at the link to the launcher icon `https://one.newrelic.com/launcher/035a0597-d6a9-46a9-97e4-a8a4b3101f2a.geo-ops`, `035a0597-d6a9-46a9-97e4-a8a4b3101f2a` is the `packageId` or `uuid` of the app/nerdpack

### Example 1 - Add a Map

1. Identify the `accountId` you're working with, most commonly this is a 7-digit number

1. Identify the `packageId` of the app/nerdpack you want to write data for, this is a uuid, example - `035a0597-d6a9-46a9-97e4-a8a4b3101f2a`

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
        Without document:

        ```bash
        newrelic-cli-0.6.0 nerdstorage document write --scope ACCOUNT --packageId 035a0597-d6a9-46a9-97e4-a8a4b3101f2a --accountId 2526305 --collection v1-maps-collection --document '<your json document>`
        ```

        With document:

        ```bash
        newrelic-cli-0.6.0 nerdstorage document write --scope ACCOUNT --packageId 035a0597-d6a9-46a9-97e4-a8a4b3101f2a --accountId 2526305 --collection v1-maps-collection --documentId 836611b8-9d08-41c7-ac81-419ae2a1fd6c --document '{
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

        Without document:

        ```bash
        newrelic-cli-0.6.0 nerdstorage document write --scope ACCOUNT --packageId 035a0597-d6a9-46a9-97e4-a8a4b3101f2a --accountId 2526305 --collection v1-maps-collection --document '<your json document>`
        ```

        With document:

        ```bash
        newrelic-cli-0.6.0 nerdstorage document write --scope ACCOUNT --packageId 035a0597-d6a9-46a9-97e4-a8a4b3101f2a --accountId 2526305 --collection v1-map-location-collection-836611b8-9d08-41c7-ac81-419ae2a1fd6c --documentId 27983350-fa72-4924-b934-8d58a7a4bd80 --document '{
            "uuid": "27983350-fa72-4924-b934-8d58a7a4bd80",
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
