import { AccountStorageQuery, AccountStorageMutation } from 'nr1';

import uuid from 'uuid/v4';
import {
  MAP_LOCATION_COLLECTION_ID,
  mapLocationCollection
} from '../constants';

// Fetch all MapLocations
export const getMapLocations = ({ accountId }) => {
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
  if (!document.mapGuid) {
    throw new Error(
      'Error creating Map Location - you must assign it to a Map'
    );
  }

  if (!document.guid) {
    document.guid = uuid();
  }

  const collection = `${MAP_LOCATION_COLLECTION_ID}-${document.mapGuid}`;

  // TO DO
  // Add method to validate the contents of the MapLocation object

  return AccountStorageMutation.mutate({
    accountId,
    actionType: AccountStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
    collection: mapLocationCollection({ mapGuid: document.mapGuid }), // Stored per-map
    documentId: document.guid, // MapLocation object guid
    document
  });
};

// Delete a map
export const deleteMapLocation = ({ accountId, document }) => {
  const { guid = false, mapGuid = false } = document;

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
    collection: mapLocationCollection({ mapGuidmapGuid }), // Stored per-map
    documentId: guid
  });
};
