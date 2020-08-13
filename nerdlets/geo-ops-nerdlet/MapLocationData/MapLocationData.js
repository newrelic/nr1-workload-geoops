import React from 'react';
import PropTypes from 'prop-types';

import { cloneDeep, findIndex } from 'lodash';
import { Stack, StackItem, Icon } from 'nr1';

import { EntityTypeAhead } from '../../shared/components';
import { FloatInput } from '../../shared/components/react-jsonschema-form';

import {
  MAP_LOCATION_UI_SCHEMA,
  MAP_LOCATION_JSON_SCHEMA
} from '../../shared/constants';

import {
  formatMapLocation, // Cast from document store to json schema types
  getMapLocation,
  writeMapLocation
} from '../../shared/services/map-location';

import {
  Description,
  MapEntitiesHeader,
  ProgressBarContainer,
  ProgressBar,
  ProgressBarFill,
  ArrowsContainer,
  EntitiesList,
  Entity,
  EntityTitle,
  EntityCheck,
  EntityDescription,
  Button,
  StyledJsonSchemaForm,
  MapEntitiesContainer
} from './styles';

export default class MapLocationData extends React.Component {
  static propTypes = {
    map: PropTypes.object,
    mapLocations: PropTypes.array,
    onMapLocationChange: PropTypes.func,
    onMapLocationWrite: PropTypes.func
  };

  constructor(props) {
    super(props);

    const schemaProperties = ['guid', 'entities', 'query'];
    const schema = (() => {
      const schema = cloneDeep(MAP_LOCATION_JSON_SCHEMA);
      schema.properties = schemaProperties.reduce(
        (previousValue, currentValue) => {
          if (schema.properties[currentValue]) {
            previousValue[currentValue] = schema.properties[currentValue];
          }
          return previousValue;
        },
        {}
      );
      return schema;
    })();

    /*
     * Customize react-jsonschema-form ui
     */
    const uiSchema = cloneDeep(MAP_LOCATION_UI_SCHEMA);
    uiSchema.entities = { 'ui:field': EntityTypeAhead };
    uiSchema.location = {
      ...uiSchema.location,
      lat: {
        ...uiSchema.location.lat,
        'ui:widget': FloatInput
      },
      lng: {
        ...uiSchema.location.lng,
        'ui:widget': FloatInput
      }
    };

    this.state = {
      selectedMapLocation: null,
      schema,
      uiSchema
    };
  }

  componentDidMount() {
    const { mapLocations } = this.props;

    // select the first location by default
    if (mapLocations.length > 0) {
      this.setState({ selectedMapLocation: mapLocations[0] });
    }
  }

  onMapLocationSelect = e => {
    const guid = e.currentTarget.getAttribute('data-guid');
    const mapLocation = this.props.mapLocations.find(
      ml => ml.document.guid === guid
    );

    if (mapLocation) {
      this.setState({ selectedMapLocation: mapLocation });
    }
  };

  onRelatedEntityChange = async ({ entities }) => {
    const { selectedMapLocation } = this.state;

    if (!selectedMapLocation) {
      throw Error('No location selected');
    }

    const updatedMapLocation = cloneDeep(selectedMapLocation);
    updatedMapLocation.relatedEntities = entities;

    const { data, errors } = await writeMapLocation({ updatedMapLocation });
    this.props.onMapLocationChange({ data, errors });
  };

  onWrite = async ({ data, error }) => {
    const { document } = data;

    this.props.onMapLocationWrite({
      mapLocation: {
        data: document,
        error
      }
    });
  };

  // TODO: How do we want to define isCompleted? Do we want to give users the ability to select this as part of a Map config?
  /* eslint-disable no-unused-vars */
  isCompleted(mapLocationObject) {
    const { document: ml } = mapLocationObject;

    // return ml.entities.length > 0 || ml.query !== '';
  }
  /* eslint-enable */

  selectLocationViaArrowNav = e => {
    const { selectedMapLocation } = this.state;
    const { mapLocations } = this.props;

    const prevOrNext = e.target.classList.contains(
      'map-entities-header-navigation-arrow-next'
    )
      ? 1
      : -1;

    const indexOfCurrentMapLocation = findIndex(mapLocations, location => {
      return location.id === selectedMapLocation.id;
    });

    if (mapLocations[indexOfCurrentMapLocation + prevOrNext]) {
      this.setState({
        selectedMapLocation:
          mapLocations[indexOfCurrentMapLocation + prevOrNext]
      });
    }
  };

  render() {
    const { map, mapLocations } = this.props;
    const { schema, selectedMapLocation, uiSchema } = this.state;
    const accountId = map.accountId;

    const formData = selectedMapLocation
      ? { ...selectedMapLocation.document }
      : {};

    /*
     * Calculate progress bar
     */
    const completedCount = mapLocations.reduce(
      (previousValue, currentValue) => {
        const isCompleted = this.isCompleted(currentValue);

        if (isCompleted) {
          previousValue = previousValue + 1;
        }

        return previousValue;
      },
      0
    );
    const totalCount = mapLocations.length;
    const percentageCompleted = `${(
      (completedCount / totalCount) * 100 || 0
    ).toFixed(0)}%`;

    return (
      <>
        <Description>
          <h4>Provide Location Data</h4>
          <p>
            Select a map location and then choose an entity to associate with
            the location
          </p>
        </Description>

        <MapEntitiesContainer>
          <MapEntitiesHeader fullHeight>
            <ProgressBarContainer>
              <ProgressBar>
                <ProgressBarFill progress={percentageCompleted} />
              </ProgressBar>
              <span>
                {completedCount} of {totalCount} completed
              </span>
            </ProgressBarContainer>
            <ArrowsContainer>
              <Button
                type="button"
                className="map-entities-header-navigation-arrow-prev u-unstyledButton"
                onClick={this.selectLocationViaArrowNav}
              >
                <Icon
                  type={Icon.TYPE.INTERFACE__CHEVRON__CHEVRON_LEFT}
                  color="#007e8a"
                />
              </Button>
              <Button
                type="button"
                className="map-entities-header-navigation-arrow-next u-unstyledButton"
                onClick={this.selectLocationViaArrowNav}
              >
                <Icon
                  type={Icon.TYPE.INTERFACE__CHEVRON__CHEVRON_RIGHT}
                  color="#007e8a"
                />
              </Button>
            </ArrowsContainer>
          </MapEntitiesHeader>
          <EntitiesList>
            {mapLocations.map(mapLocationObject => {
              const { document: ml } = mapLocationObject;
              const isCompleted = this.isCompleted(mapLocationObject);

              const isActive =
                selectedMapLocation &&
                selectedMapLocation.document.guid === ml.guid;

              const { description = false } = ml.location;

              return (
                <Entity
                  key={ml.guid}
                  isCompleted={isCompleted}
                  isActive={isActive}
                  onClick={this.onMapLocationSelect}
                  data-guid={ml.guid}
                >
                  <Stack verticalType={Stack.VERTICAL_TYPE.CENTER}>
                    <StackItem>
                      <EntityCheck
                        isCompleted={isCompleted}
                        isActive={isActive}
                      />
                    </StackItem>
                    <EntityTitle isCompleted={isCompleted} isActive={isActive}>
                      {ml.title}
                    </EntityTitle>
                    {description && (
                      <EntityDescription
                        isCompleted={isCompleted}
                        isActive={isActive}
                      >
                        {description}
                      </EntityDescription>
                    )}
                  </Stack>
                </Entity>
              );
            })}
          </EntitiesList>
          {selectedMapLocation && (
            <StyledJsonSchemaForm
              schema={schema}
              uiSchema={uiSchema}
              defaultValues={false}
              formData={formData}
              fetchDocument={() =>
                getMapLocation({
                  accountId,
                  documentId: selectedMapLocation.document.guid,
                  mapGuid: selectedMapLocation.document.map
                })
              }
              formatDocument={formatMapLocation}
              writeDocument={({ formData }) =>
                writeMapLocation({
                  accountId,
                  documentId: selectedMapLocation.guid,
                  document: formData
                })
              }
              onWrite={this.onWrite}
            />
          )}
        </MapEntitiesContainer>
      </>
    );
  }
}
