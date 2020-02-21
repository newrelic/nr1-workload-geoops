import { AccountStorageQuery, AccountStorageMutation } from 'nr1';

import uuid from 'uuid/v4';
import { LOCATION_COLLECTION_ID } from '../constants';

// Fetch all locations
export const getLocations = ({ accountId, fixtureData = false }) => {
  if (fixtureData) {
    return Promise.resolve({
      data: [
        {
          id: 'asdf-asdf-asdf',
          document: {
            guid: 'asdf-asdf-asdf',
            title: 'Harrisburg, Pennsylvania',
            lat: '40.2732',
            lng: '76.8867'
          }
        }
      ],
      errors: null
    });
  }

  return AccountStorageQuery.query({
    collection: LOCATION_COLLECTION_ID,
    accountId: accountId
  });
};

// Fetch single Location
export const getLocation = ({ accountId, guid }) => {
  return AccountStorageQuery.query({
    collection: LOCATION_COLLECTION_ID,
    accountId: accountId,
    documentId: guid
  });
};

// Create or Update a Location
export const writeLocation = ({ accountId, document }) => {
  if (!document.guid) {
    document.guid = uuid();
  }

  // TO DO
  // Add method to validate the contents of the Location object

  return AccountStorageMutation.mutate({
    accountId,
    actionType: AccountStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
    collection: LOCATION_COLLECTION_ID,
    documentId: document.guid,
    document
  });
};

// Delete a Location
export const deleteLocation = ({ accountId, guid }) => {
  if (!guid) {
    throw new Error('Error deleting Location, guid not provided');
  }

  return AccountStorageMutation.mutate({
    accountId,
    actionType: AccountStorageMutation.ACTION_TYPE.DELETE_DOCUMENT,
    collection: LOCATION_COLLECTION_ID,
    documentId: guid
  });
};

// Delete a Location
export const deleteLocations = ({ accountId }) => {
  return AccountStorageMutation.mutate({
    accountId,
    actionType: AccountStorageMutation.ACTION_TYPE.DELETE_COLLECTION,
    collection: LOCATION_COLLECTION_ID
  });
};
