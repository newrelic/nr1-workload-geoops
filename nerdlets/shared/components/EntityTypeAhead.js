import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import get from 'lodash.get';
import { NerdGraphQuery, Spinner } from 'nr1';
import { NerdGraphError } from '@newrelic/nr1-community';

import { ENTITY_SEARCH_BY_TYPE } from '../services/queries';

export default class EntityTypeAhead extends React.PureComponent {
  static propTypes = {
    formData: PropTypes.array,
    onChange: PropTypes.func
  };

  constructor(props) {
    super(props);
    // console.log(props);
    this.state = {
      //
    };
  }

  entitySearchQueryVariables() {
    // console.log(this.props);
    // const { formData } = this.props;
    const query = `(domain = 'NR1' and type = 'WORKLOAD')`;

    // TO DO - How do we indicate all those selected already?

    // if (formData && formData !== undefined && formData.length > 0) {
    //   const ids = formData.map(v => v.guid);
    //   console.log(ids);
    //   if (Array.isArray(ids)) {
    //     query = `${query} OR id IN ("${ids.join('", "')`')`}`;
    //   }
    // }

    return {
      query
    };
  }

  render() {
    const { formData } = this.props;
    const entitySearchVariables = this.entitySearchQueryVariables();

    const customStyles = {
      dropdownIndicator: provided => ({
        ...provided,
        transform: 'scale(.7)'
      }),
      control: (provided, state) => ({
        display: 'flex',
        backgroundColor: '#fff',
        borderRadius: '2px',
        border: state.isFocused ? '1px solid #8e9494' : '1px solid #d5d7d7',
        boxShadow: state.isFocused ? 'none' : 'none',
        '&:hover': {
          cursor: 'text'
        },
        maxHeight: '32px'
      }),
      valueContainer: provided => ({
        ...provided,
        padding: '2px 4px'
      }),
      multiValue: (provided, state) => ({
        display: 'flex',
        alignItems: 'stretch',
        height: '22px',
        marginRight: '4px',
        borderRadius: '3px',
        backgroundColor: '#F0FCFC',
        border: state.isFocused ? '1px solid #70ccd2' : '1px solid #70ccd2'
      }),
      multiValueLabel: () => ({
        padding: '0 8px',
        color: '#005054',
        fontSize: '11px',
        lineHeight: '20px'
      }),
      option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isFocused ? '#d9f0f0' : 'transparent',
        '&:hover': {
          backgroundColor: '#d9f0f0',
          color: '#005054'
        },
        '&:active': {
          backgroundColor: '#007e8a',
          color: '#fff'
        }
      }),
      indicatorSeparator: () => ({
        display: 'none'
      })
    };

    const ClearIndicatorStyle = {};

    const ClearIndicator = ({ innerProps, innerRef }) => (
      <div
        {...innerProps}
        style={ClearIndicatorStyle}
        className="multi-value-remove"
        ref={innerRef}
      >
        <svg
          width="7"
          height="7"
          viewBox="0 0 7 7"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M5.59998 0.600006L3.49998 2.80001L1.39998 0.600006L0.599976 1.40001L2.79998 3.50001L0.599976 5.60001L1.39998 6.40001L3.49998 4.20001L5.59998 6.40001L6.39998 5.60001L4.19998 3.50001L6.39998 1.40001L5.59998 0.600006Z"
            fill="#005054"
          />
        </svg>
      </div>
    );

    return (
      <>
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

            const items = get(data, 'actor.entitySearch.results.entities', []);
            const options = items.map(i => ({ value: i.guid, label: i.name }));

            // Hmm, how do we get the name for the currently assigned entity guids...

            const currentValue = formData
              ? formData.map(i => ({
                  value: i.guid,
                  label: options.find(o => o.value === i.guid).label
                }))
              : [];

            return (
              <div className="form-input-col-12 form-input-container">
                <label htmlFor="entity-type-ahead" className="control-label">
                  Workloads *
                </label>
                <Select
                  id="entity-type-ahead"
                  isMulti
                  options={options}
                  defaultValue={currentValue}
                  placeholder="Select 1 or more workloads..."
                  styles={customStyles}
                  components={{
                    ClearIndicator: ClearIndicator,
                    MultiValueRemove: ClearIndicator
                  }}
                />
              </div>
            );
          }}
        </NerdGraphQuery>
      </>
    );
  }
}
