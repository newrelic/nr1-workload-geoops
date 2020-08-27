import { AccountStorageQuery, AccountStorageMutation } from 'nr1';

import uuid from 'uuid/v4';
import { mapLocationCollection } from '../constants';
import uniq from 'lodash.uniq';

/*
 * NerdStorage is a document store, and only stores values as strings
 * JSON Schema driven forms require that data be cast to the correct data type
 *
 * After fetching a document from NerdStorage, provide a way to "type cast"
 * any numbers/floats/etc. to their appropriate type (from string)
 */
export const formatMapLocation = mapLocation => {
  const i = mapLocation;

  if (!mapLocation || !mapLocation.location) {
    // eslint-disable-next-line no-console
    console.warn(
      "Attempt to format MapLocation's lat/lng but no location data found"
    );
    // console.debug(mapLocation);
    return mapLocation;
  }

  const lat = i.location.lat;
  const lng = i.location.lng;

  const formatted = {
    ...i,
    location: {
      ...i.location,
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null
    }
  };

  return formatted;
};

/**
 *
 *
 * @param { string | int } accountId
 * @param { Object } map
 */
export const getMapLocationsAndEntities = async ({ accountId, map }) => {
  const { data: mapLocations } = await getMapLocations({
    accountId: parseInt(accountId, 10),
    document: map
  });
  const allEntities = mapLocations.reduce((previousValue, currentValue) => {
    const entities = currentValue.document.entities || [];
    previousValue.push(...entities);
    return previousValue;
  }, []);
  const entityGuids = uniq(allEntities.map(e => e.guid));
  return {
    entityGuids,
    mapLocations
  };
};

// Fetch all MapLocations
export const getMapLocations = ({
  accountId,
  document,
  fixtureData = false
}) => {
  if (fixtureData) {
    return Promise.resolve({
      data: []
    });
  }

  return AccountStorageQuery.query({
    collection: mapLocationCollection({ mapGuid: document.guid }),
    accountId: accountId
  });
};

// Fetch single map
export const getMapLocation = ({ accountId, documentId, mapGuid }) => {
  return AccountStorageQuery.query({
    collection: mapLocationCollection({ mapGuid }), // Stored per-map
    accountId,
    documentId
  });
};

// Create or Update a map
export const writeMapLocation = ({ accountId, document }) => {
  if (!document.map) {
    throw new Error(
      'Error creating Map Location - you must assign it to a Map'
    );
  }

  if (!document.guid) {
    document.guid = uuid();
  }

  // TODO: Add method to validate the contents of the MapLocation object

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
      'Error deleting Map Location - you must assign it to a Map'
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
  return AccountStorageMutation.mutate({
    accountId: accountId,
    collection: mapLocationCollection({ mapGuid }),
    actionType: AccountStorageMutation.ACTION_TYPE.DELETE_COLLECTION
  });
};
