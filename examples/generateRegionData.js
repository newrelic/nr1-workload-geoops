'use strict';

const fs = require('fs');

const rawdata = fs.readFileSync('ikea-store-list.json');
const data = JSON.parse(rawdata);

// eslint-disable-next-line prettier/prettier
const regionLookup = {  "AK": "West",  "AL": "Southeast",  "AR": "Southeast",  "AZ": "Southwest",  "CA": "West",  "CO": "West",  "CT": "Northeast",  "DC": "Northeast",  "DE": "Northeast",  "FL": "Southeast",  "GA": "Southeast",  "HI": "West",  "IA": "Midwest",  "ID": "West",  "IL": "Midwest",  "IN": "Midwest",  "KS": "Midwest",  "KY": "Southeast",  "LA": "Southeast",  "MA": "Northeast",  "MD": "Northeast",  "ME": "Northeast",  "MI": "Midwest",  "MN": "Midwest",  "MO": "Midwest",  "MS": "Southeast",  "MT": "West",  "NC": "Southeast",  "ND": "Midwest",  "NE": "Midwest",  "NH": "Northeast",  "NJ": "Northeast",  "NM": "Southwest",  "NV": "West",  "NY": "Northeast",  "OH": "Midwest",  "OK": "Southwest",  "OR": "West",  "PA": "Northeast",  "RI": "Northeast",  "SC": "Southeast",  "SD": "Midwest",  "TN": "Southeast",  "TX": "Southwest",  "UT": "West",  "VA": "Southeast",  "VT": "Northeast",  "WA": "West",  "WI": "Midwest",  "WV": "Southeast",  "WY": "West" };

/*
  {
    storeId: 50,
    storeCity: 'Renton',
    storeState: 'WA',
    storeAddress: '601 SW 41st St',
    storeZip: '98057',
    storeNumber: '488',
    storeURL:
     'https://www.ikea.com/us/en/stores/renton/?itm_campaign=lsf-mobile&itm_element=Button-LSP&itm_content=renton',
    offersURL:
     'https://www.ikea.com/us/en/stores/renton/?itm_campaign=lsf-mobile&itm_element=Button-LSP&itm_content=renton',
    geoURL:
     'https://www.google.com/maps/dir/Current+Location/601+SW+41st+St+Renton+WA+98057',
    geoLat: '47.4424256',
    geoLng: '-122.22569240000001',
    storeType: 'market'
  }
*/

const mapLocations = data.reduce((p, v) => {
  const {
    geoLat,
    geoLng,
    storeId,
    storeCity,
    storeState,
    storeAddress,
    storeZip,
    storeNumber
  } = v;

  const mapLocation = {
    externalId: storeNumber,
    title: storeAddress,
    location: {
      municipality: storeCity,
      region: storeState,
      country: 'USA',
      postalCode: storeZip,
      description: 'Nulla quis tortor orci. Etiam at risus et justo dignissim.',
      lat: geoLat,
      lng: geoLng
    },
    query:
      "FROM Transaction SELECT average(duration) FACET entityGuid, appName WHERE entityGuid in ('NjMwMDYwfEFQTXxBUFBMSUNBVElPTnw2MDgwNzg2')",
    entities: [
      {
        guid:
          Math.random() < 0.5
            ? 'NjMwMDYwfE5SMXxXT1JLTE9BRHw1ODM'
            : 'NjMwMDYwfE5SMXxXT1JLTE9BRHwzODI',
        entityType: 'WORKLOAD_ENTITY'
      }
    ],
    contactEmail: 'foo@foo.com',
    runbookUrl:
      'https://docs.google.com/document/d/1NOWVNqJ9G8Ks5jIf2HVRj2CLP0Mjui1FsaIqs7kXy-Y/edit'
  };

  p.push(mapLocation);
  return p;
}, []);
// console.log(JSON.stringify(mapLocations, null, 2))

const byRegion = mapLocations.reduce((p, v) => {
  const state = v.location.region;
  const region = regionLookup[state];
  // console.log(region);

  if (!p[region]) {
    p[region] = [];
  }

  p[region].push(v);

  return p;
}, {});
// console.log(JSON.stringify(byRegion, null, 2));

Object.entries(byRegion).forEach(([k, v]) => {
  const fileName = `sample-data-${k.toLowerCase()}.json`;
  const fileOutput = {
    items: v
  };
  const fileData = JSON.stringify(fileOutput, null, 2);
  fs.writeFileSync(fileName, fileData);
});
