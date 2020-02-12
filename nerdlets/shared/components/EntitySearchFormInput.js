import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash.get';
import cloneDeep from 'lodash.clonedeep';

import { Grid, GridItem, NerdGraphQuery, Spinner } from 'nr1';
import { NerdGraphError } from '@newrelic/nr1-community';

import { LIST_ENTITY_TYPES, ENTITY_SEARCH_BY_TYPE } from '../services/queries';

/*
 * TO DO - Turn entity selection dropdown into a searchable multi-select
 */
export default class EntitySearchFormInput extends React.PureComponent {
  static propTypes = {
    formData: PropTypes.shape({
      entities: PropTypes.array
    }),
    onChange: PropTypes.func
  };

  constructor(props) {
    super(props);

    const entities = get(props, 'formData.entities', false);
    const hasRelatedEntities = entities ? entities.length > 0 : false;

    this.state = {
      entityTypes: [],
      selectedEntityType: hasRelatedEntities ? entities.type : null,
      selectedEntities: hasRelatedEntities ? entities : null,
      formData: props.formData,

      loadingEntityTypes: false,
      loadingEntityTypesErrors: null,

      loadingEntities: false,
      loadingEntitiesErrors: null
    };

    this.onSelectEntityType = this.onSelectEntityType.bind(this);
    this.onSelectEntity = this.onSelectEntity.bind(this);
  }

  componentDidMount() {
    this.load();
  }

  async load() {
    await this.loadEntityTypes();
  }

  async loadEntityTypes() {
    this.setState({ loadingEntityTypes: true, loadingEntities: true });

    const {
      data: entityTypes,
      errors: loadingEntityTypesErrors
    } = await this.fetchEntityTypes();

    // Default to workload if possible
    const workloadType = entityTypes.find(t => t.type === 'WORKLOAD');

    this.setState(prevState => {
      return {
        loadingEntityTypes: false,
        entityTypes,
        selectedEntityType:
          !prevState.selectedEntityType && workloadType ? workloadType : null,
        loadingEntityTypesErrors
      };
    });
  }

  async fetchEntityTypes() {
    const { data, errors } = await NerdGraphQuery.query({
      query: LIST_ENTITY_TYPES
    });
    const items = get(data, 'actor.entitySearch.types', []);
    return { data: items, errors };
  }

  entitySearchQueryVariables() {
    const { selectedEntityType, selectedEntities } = this.state;
    const defaultVariables = {
      query: '(domain = "NR1" and type = "workload")'
    };

    if (!selectedEntityType) {
      return defaultVariables;
    }

    const { domain, type } = selectedEntityType;

    if (!domain || !type) {
      return defaultVariables;
    }

    let query =
      domain && type ? `(domain = '${domain}' and type='${type}')` : '';

    if (selectedEntities) {
      const ids = selectedEntities.map(v => v.entityGuid);
      query = `${query} OR id IN ("${ids.join('", "')`')`}`;
    }

    return {
      query
    };
  }

  onChange({ selectedEntityGuid }) {
    const { formData } = this.state;
    const newFormData = cloneDeep(formData);
    newFormData.entities = [selectedEntityGuid];

    this.setState(
      {
        formData: newFormData
      },
      () => this.props.onChange(newFormData)
    );
  }

  onSelectEntityType(e) {
    const { entityTypes } = this.state;
    const value = e.target.value;

    const selectedEntityType = entityTypes.find(
      item => value === `${item.domain} - ${item.type}`
    );

    this.setState({ selectedEntityType });
  }

  onSelectEntity(e) {
    const selectedEntityGuid = e.target.value;
    this.onChange({ selectedEntityGuid });
  }

  render() {
    const {
      entityTypes,
      selectedEntityType,
      selectedEntities,
      loadingEntityTypes,
      loadingEntityTypesErrors,
      loadingEntities,
      loadingEntitiesErrors
    } = this.state;

    const selectedEntityTypeValue = selectedEntityType
      ? `${selectedEntityType.domain} - ${selectedEntityType.type}`
      : 'Choose an Entity Type...';

    const entitySearchVariables = this.entitySearchQueryVariables();

    return (
      <>
        <Grid>
          <GridItem>
            {/* Entity Types */}
            {loadingEntityTypes && <Spinner />}
            {loadingEntityTypesErrors && (
              <NerdGraphError error={loadingEntityTypesErrors} />
            )}

            <select
              value={selectedEntityTypeValue}
              onChange={this.onSelectEntityType}
            >
              {entityTypes.map((item, index) => {
                // An entity's (domain + type) should be unique?
                const value = `${item.domain} - ${item.type}`;
                return (
                  <option key={index} value={value}>
                    {value}
                  </option>
                );
              })}
            </select>
          </GridItem>

          <GridItem>
            {loadingEntities && <Spinner />}
            {loadingEntityTypesErrors && (
              <NerdGraphError error={loadingEntitiesErrors} />
            )}

            {/* Select an Entity */}
            <NerdGraphQuery
              query={ENTITY_SEARCH_BY_TYPE}
              variables={entitySearchVariables}
            >
              {({ loading, error, data }) => {
                if (loading) {
                  return <Spinner />;
                }

                if (error) {
                  return <NerdGraphError error={error} />;
                }

                const selectedEntityValue =
                  selectedEntityGuid || 'Choose an Entity...';

                // Assume one workload for now - in the future we should/could morph this to be a multi-select
                const selectedEntityGuid = selectedEntities
                  ? selectedEntities[0]
                  : false;

                const items = get(
                  data,
                  'actor.entitySearch.results.entities',
                  []
                );
                return (
                  <select
                    value={selectedEntityValue}
                    items={items}
                    onChange={this.onSelectEntity}
                  >
                    {items.map((item, index) => (
                      <option key={index} value={item.guid}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                );
              }}
            </NerdGraphQuery>
          </GridItem>
        </Grid>
      </>
    );
  }
}
