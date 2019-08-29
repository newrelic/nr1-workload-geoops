const geoopsConfig = [
  {
    id: "1af7cff8-59a4-46c3-9c95-da44bad5ba6c",
    title: "Demo Map #1",
    center: [34.089,	-83.947],
    zoom: 10,
    detailWindow: "overlay", //["overlay", "card"]
    labels: {
      address: "Address",
      locationId: "Store ID",
      locationName: "Store",
      entityName: "Entity",
      lastIncident: "Last Incident",
      municipatility: "City",
      region: "State",
      country: "Country",
      postalCode: "Zip"
    },
    entities: {
      additionalEntityTypes: [{domain: "APM", type: "APPLICATION"}],
      joins: {
        INFRA: {
          associationTypes: ["nrqlToEntitySearch"],
          nrql: {
            accountId: 2220678,
            query: "FROM SystemSample SELECT latest(timestamp) FACET entityGuid, hostname WHERE locationId in (%1)"
          }
        },
        APM: {
          associationType: ["relationships"], //other array options: "nrqlToEntitySearch" "relationships"
          nrql: {
            accountId: 2220678,
            query: "FROM Transaction SELECT latest(timestamp) FACET entityGuid, appName WHERE locationId in (%1) or entityGuid in (%2)"
          }
        }
      }
    },
    locations: [{
      id: "c4b1fe6f-408c-48a2-91cf-e9a01769d100",
      locationId: "12345",  //customer-defined identifir for a store or location
      lat: 34.089,
      lng:	-83.947,
      locationName: "Buford",
      //address1: "",
      //address2: "",
      municipatility: "Buford",
      region: "GA",
      country: "USA",
      postalCode: "30519",
      demoMode: {
        infraGuids: ["MjIyMDY3OHxJTkZSQXxOQXw4NDk4ODQ0NjA0ODk1MzUwNDkx", "MjIyMDY3OHxJTkZSQXxOQXw4MjM0OTQ4MDEyMDU0Nzk3NTk0", "MjIyMDY3OHxJTkZSQXxOQXw1OTIxNzcyMDk4MjYzOTIwMDM2", "MjIyMDY3OHxJTkZSQXxOQXwxNzA3MjM3MzYyNDk4MTEwMDQx"],
        apmGuids: ["MjIyMDY3OHxBUE18QVBQTElDQVRJT058MjEwMjY3MDI1","MjIyMDY3OHxBUE18QVBQTElDQVRJT058MjEwMjU4Mzgz","MjIyMDY3OHxBUE18QVBQTElDQVRJT058MjEwMjU4OTg4", "MjIyMDY3OHxBUE18QVBQTElDQVRJT058MzA0MjY2NzI3",
        "MjIyMDY3OHxBUE18QVBQTElDQVRJT058MjEwMjE3Njc1","MjIyMDY3OHxBUE18QVBQTElDQVRJT058MjA5OTYyNzY4"]
      }
    },{
      id: "8462ae92-3007-4791-8848-897059a41ba7",
      locationId: "12345",  //customer-defined identifir for a store or location
      lat: 34.062,
      lng:	-84.24,
      locationName: "Alpharetta",
      //address1: "",
      //address2: "",
      municipatility: "Alpharetta",
      region: "GA",
      country: "USA",
      postalCode: "30202",
      demoMode: {
        infraGuids: ["MjIyMDY3OHxJTkZSQXxOQXw1ODc1ODg0MDA2ODkxNjY2MzM2"],
        apmGuids: null
      }
    },{
      id: "16958c1e-c7b9-4a2a-8c48-5c7214fa8ba6",
      locationId: "12347",  //customer-defined identifir for a store or location
      lat: 34.193,
      lng: -84.093,
      locationName: "Cumming",
      //address1: "",
      //address2: "",
      municipatility: "Cumming",
      region: "GA",
      country: "USA",
      postalCode: "30028",
      demoMode: {
        infraGuids: ["MjIyMDY3OHxJTkZSQXxOQXw2NDUxNTAzNjM5MDY1NDIxNzM4"],
        apmGuids: null
      }
    }]
  }
];
export default geoopsConfig;