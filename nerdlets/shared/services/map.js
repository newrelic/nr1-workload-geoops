import get from 'lodash.get';

import { AccountStorageQuery, AccountStorageMutation } from 'nr1';

import { getAccounts } from './account';
import { deleteMapLocationCollection } from './map-location';

import { MAP_COLLECTION_ID } from '../constants';

/*
 * TO DO:
 *  1. Detect a lot of accounts, greater than... 50, and do something different in the UI
 *  2. Add accountId to map object
 */
// Fetch all maps
export const getMaps = ({ accountId }) => {
  if (accountId) {
    return AccountStorageQuery.query({
      collection: MAP_COLLECTION_ID,
      accountId: accountId
    });
  }

  return getAccounts().then(({ data, errors }) => {
    if (errors && errors.length > 0) {
      // return { data, errors };
      return Promise.resolve({ data, errors });
    }

    const accounts = get(data, 'actor.accounts', []);
    const promises = accounts.map(a => {
      return getMaps({ accountId: a.id });
    });

    return Promise.all(promises);
  });
};

// Fetch single map
export const getMap = ({ accountId, documentId }) => {
  return AccountStorageQuery.query({
    collection: MAP_COLLECTION_ID,
    accountId,
    documentId
  });
};

// Create or Update a map
export const writeMap = ({ accountId, documentId, document }) => {
  if (!documentId) {
    throw new Error('No map guid provided');
  }

  // if (document.guid !== documentId) {
  //   console.warn('Map guid does not match NerdStorage documentId');
  //   console.debug(documentId);
  //   console.debug(document);
  // }

  document.accountId = accountId;

  // TO DO
  // Add method to validate the contents of the map object

  return AccountStorageMutation.mutate({
    accountId,
    actionType: AccountStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
    collection: MAP_COLLECTION_ID,
    documentId,
    document
  });
};

// Delete a map
export const deleteMap = ({ map }) => {
  const { accountId, guid } = map;

  if (!accountId) {
    throw new Error('Error deleting map, map has no accountId');
  }

  if (!guid) {
    throw new Error('Error deleting map, map has no guid');
  }

  const deleteMapLocations = deleteMapLocationCollection({
    accountId,
    mapGuid: guid
  });

  const deleteMap = AccountStorageMutation.mutate({
    accountId,
    actionType: AccountStorageMutation.ACTION_TYPE.DELETE_DOCUMENT,
    collection: MAP_COLLECTION_ID,
    documentId: guid
  });

  return Promise.all([deleteMapLocations, deleteMap]);
};
