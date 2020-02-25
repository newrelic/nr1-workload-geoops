import React from 'react';
import Select from 'react-select';
import { Icon } from 'nr1';

export default class EntityTypeAhead extends React.PureComponent {
  render() {
    const options = [
      { value: 'chocolate', label: 'Chocolate' },
      { value: 'strawberry', label: 'Strawberry' },
      { value: 'vanilla', label: 'Vanilla' }
    ];

    const customStyles = {
      dropdownIndicator: provided => ({
        ...provided,
        transform: 'scale(.7)'
      }),
      control: provided => ({
        ...provided,
        borderRadius: '2px',
        borderColor: '#d5d7d7'
      }),
      multiValue: () => ({
        display: 'flex',
        alignItems: 'stretch',
        height: '24px',
        borderRadius: '3px',
        backgroundColor: '#F0FCFC',
        border: '1px solid #70ccd2'
      }),
      multiValueLabel: () => ({
        padding: '0 8px',
        color: '#005054',
        fontSize: '11px'
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
        <div className="form-input-col-12 form-input-container">
          <label htmlFor="entity-type-ahead" className="control-label">
            Workloads *
          </label>
          <Select
            id="entity-type-ahead"
            isMulti
            options={options}
            placeholder="Select 1 or more workloads..."
            styles={customStyles}
            components={{
              ClearIndicator: ClearIndicator,
              MultiValueRemove: ClearIndicator
            }}
          />
        </div>
      </>
    );
  }
}
