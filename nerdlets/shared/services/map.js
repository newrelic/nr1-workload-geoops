import { AccountStorageQuery, AccountStorageMutation } from 'nr1';

import uuid from 'uuid/v4';
import { MAP_COLLECTION_ID } from '../constants';

// Fetch all maps
export const getMaps = ({ accountId }) => {
  return AccountStorageQuery.query({
    collection: MAP_COLLECTION_ID,
    accountId: accountId
  });
};

// Fetch single map
export const getMap = ({ accountId, guid }) => {
  return AccountStorageQuery.query({
    collection: MAP_COLLECTION_ID,
    accountId: accountId,
    documentId: guid
  });
};

// Create or Update a map
export const writeMap = ({ accountId, document }) => {
  if (!document.guid) {
    document.guid = uuid();
  }

  // TO DO
  // Add method to validate the contents of the map object

  return AccountStorageMutation.mutate({
    accountId,
    actionType: AccountStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
    collection: MAP_COLLECTION_ID,
    documentId: document.guid,
    document
  });
};

// Delete a map
export const deleteMap = ({ accountId, guid }) => {
  if (!guid) {
    throw new Error('Error deleting map, guid not provided');
  }

  return AccountStorageMutation.mutate({
    accountId,
    actionType: AccountStorageMutation.ACTION_TYPE.DELETE_DOCUMENT,
    collection: MAP_COLLECTION_ID,
    documentId: guid
  });
};
