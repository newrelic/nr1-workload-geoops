import React from 'react';
import PropTypes from 'prop-types';

import { cloneDeep, findIndex } from 'lodash';
import { Stack, StackItem, Icon } from 'nr1';
import styled from 'styled-components';

import { JsonSchemaForm, EntityTypeAhead } from '../shared/components';
import { FloatInput } from '../shared/components/react-jsonschema-form';

import {
  MAP_LOCATION_UI_SCHEMA,
  MAP_LOCATION_JSON_SCHEMA
} from '../shared/constants';

import {
  formatMapLocation, // Cast from document store to json schema types
  getMapLocation,
  writeMapLocation
} from '../shared/services/map-location';

const Description = styled.div`
  h4 {
    text-align: center;
    margin-bottom: 4px;
  }

  p {
    text-align: center;
    color: #8e9494;
  }
`;

const MapEntitiesHeader = styled(Stack)`
  display: flex;
  justify-content: space-between !important;
  background-color: #f4f5f5;
  border-radius: 4px 4px 0 0;
  width: 100%;
  border: 1px solid #d5d7d7;
  height: 30px;
`;

const ProgressBarContainer = styled(StackItem)`
  display: flex;
  height: 100%;
  align-items: center;
  padding: 0 8px;

  > span {
    font-size: 12px;
    color: #8e9494;
    font-variant-numeric: tabular-nums;
  }
`;

const ProgressBar = styled.div`
  width: 200px;
  height: 6px;
  margin-right: 8px;
  background-color: #d5d7d7;
  border-radius: 10px;
`;

const ProgressBarFill = styled.div`
  width: ${({ progress }) => progress};
  height: 6px;
  background-color: #007e8a;
  border-radius: 10px;
`;

const ArrowsContainer = styled(StackItem)`
  display: flex;
  flex-direction: row;
`;

const EntitiesList = styled.ul`
  height: 160px;
  overflow: scroll;
  border-left: 1px solid #d5d7d7;
  border-right: 1px solid #d5d7d7;
  margin-bottom: 0;
  list-style-type: none;
`;

const Entity = styled.li`
  padding: 10px 8px;
  border-bottom: 1px solid #edeeee;

  :hover {
    cursor: pointer;
    background-color: ${({ isActive }) => (isActive ? '#f4f5f5' : '#fafbfb')};
  }

  :hover {
    .map-entities-location-list-item-check {
      box-shadow: inset 0 0 0 2px #b9bdbd;
    }
  }

  ${({ isActive }) =>
    isActive &&
    `position: relative;
    z-index: 100;
    background-color: #f4f5f5;
  `}
`;

const EntityTitle = styled(StackItem)`
  margin-right: 4px;
  font-size: 14px;
  font-weight: 600;
  color: #464e4e;

  ${({ isActive }) => isActive && 'color: #000d0d;'}

  ${({ isCompleted }) =>
    isCompleted &&
    `color: #8e9494;
    text-decoration: line-through;
  `}
`;

const EntityCheck = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 100px;
  box-shadow: ${({ isCompleted, isActive }) =>
    isActive && !isCompleted
      ? 'inset 0 0 0 2px #000d0d'
      : 'inset 0 0 0 2px #d5d7d7'};

  ${({ isCompleted }) =>
    isCompleted &&
    `background-color: #007e8a;
      box-shadow: none;
      background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAVCAYAAABYHP4bAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACqSURBVHgB7dTNDYMwDAVgj9AROkI3ajZpN+gIHaGjMEJH4ML/5WEjkCxkBFJsTjzJJ0g+R7FCFBgAN4pOD7w6oAjFBGlZkArDNKIx8oyFSNXAm7xyIech/OP9yDhmI1z/vdnfQrjSYUQt+rojJXe/QkwsC1EnStYmDfCR7wPwzEaWVMCDNy6NJ+TnhuxhrojGNu4McxOJvGJM4YRIE+QdjYUhGmOkCEU8MwJ6WU8SrbeehQAAAABJRU5ErkJggg==');
      background-size: 50%;
      background-position: 5px center;
      background-repeat: no-repeat;
    `}
`;

const EntityDescription = styled(StackItem)`
  margin-left: 0;
  color: ${({ isCompleted, isActive }) =>
    isCompleted || isActive ? '#8e9494' : '#464e4e'};

  :before {
    content: ' - ';
  }

  text-decoration: ${({ isCompleted }) => isCompleted && 'line-through'};
`;

const Button = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 28px;
  background-color: transparent;
  border: none;
  border-left: 1px solid #d5d7d7;

  &:hover {
    background-color: #edeeee;
  }

  &:active {
    background-color: #e3e4e4;

    .ic-Icon {
      bottom: 0;
    }
  }

  .ic-Icon {
    position: relative;
    bottom: 1px;
    pointer-events: none;
  }
`;

const StyledJsonSchemaForm = styled(JsonSchemaForm)`
  background-color: #f4f5f5;
  padding: 16px;
  border-radius: 0 0 4px 4px;
  border: 1px solid #d5d7d7;
  border-top-color: #e3e4e4;

  .form-group {
    margin-bottom: 16px;
  }

  .field-object {
    margin-bottom: 0;

    & + div {
      text-align: center;
    }
  }

  .btn {
    color: #fff;
    background-color: #007e8a;
    display: inline-block !important;
    text-align: center;
  }
`;

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

    this.onWrite = this.onWrite.bind(this);
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

        <div>
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
        </div>
      </>
    );
  }
}
