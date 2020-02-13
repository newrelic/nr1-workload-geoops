import { AccountStorageQuery, AccountStorageMutation } from 'nr1';

import uuid from 'uuid/v4';
import {
  MAP_LOCATION_COLLECTION_ID,
  mapLocationCollection
} from '../constants';

// Fetch all MapLocations
export const getMapLocations = ({ accountId, fixtureData = false }) => {
  if (fixtureData) {
    return Promise.resolve({
      data: []
    });
  }
  return AccountStorageQuery.query({
    collection: MAP_LOCATION_COLLECTION_ID,
    accountId: accountId
  });
};

// Fetch single map
export const getMapLocation = ({ accountId, guid }) => {
  return AccountStorageQuery.query({
    collection: MAP_LOCATION_COLLECTION_ID,
    accountId: accountId,
    documentId: guid
  });
};

// Create or Update a map
export const writeMapLocation = ({ accountId, document }) => {
  console.log(document);
  if (!document.map) {
    throw new Error(
      'Error creating Map Location - you must assign it to a Map'
    );
  }

  if (!document.guid) {
    document.guid = uuid();
  }

  // TO DO
  // Add method to validate the contents of the MapLocation object

  return AccountStorageMutation.mutate({
    accountId,
    actionType: AccountStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
    collection: mapLocationCollection({ mapGuid: document.map }), // Stored per-map
    documentId: document.guid, // MapLocation object guid
    document
  });
};

// Delete a single map location
export const deleteMapLocation = ({ accountId, document }) => {
  const { guid = false, map = false } = document;
  const mapGuid = map;

  if (!mapGuid) {
    throw new Error(
      'Error creating Map Location - you must assign it to a Map'
    );
  }

  if (!guid) {
    throw new Error('Error deleting map location, guid not provided');
  }

  return AccountStorageMutation.mutate({
    accountId,
    actionType: AccountStorageMutation.ACTION_TYPE.DELETE_DOCUMENT,
    collection: mapLocationCollection({ mapGuid }), // Stored per-map
    documentId: guid
  });
};

// Delete entire collection of map locations
export const deleteMapLocationCollection = ({ accountId, mapGuid }) => {
  return AccountStorageQuery.query({
    accountId: accountId,
    collection: mapLocationCollection({ mapGuid }),
    actionType: AccountStorageMutation.ACTION_TYPE.DELETE_COLLECTION
  });
};
