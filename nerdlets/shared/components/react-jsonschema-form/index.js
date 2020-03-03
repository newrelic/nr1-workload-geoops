/* eslint-disable react/prop-types */
import React from 'react';

// Widgets are html inputs
// Fields are form "rows", i.e. contains many widgets/inputs

// https://react-jsonschema-form.readthedocs.io/en/latest/advanced-customization/#custom-widget-components
// https://react-jsonschema-form.readthedocs.io/en/latest/advanced-customization/#field-template

export const FormInputFullWidth = function(props) {
  const { id, label, required, children } = props;
  return (
    <div className="form-input-col-12 form-input-container">
      <label htmlFor={id} className="control-label">
        {label}
        {required ? '*' : null}
      </label>
      {children}
    </div>
  );
};

export const FormInputTwoColumn = function(props) {
  const { id, label, required, children } = props;
  return (
    <div className="form-input-col-6 form-input-container">
      <label htmlFor={id} className="control-label">
        {label}
        {required ? '*' : null}
      </label>
      {children}
    </div>
  );
};

export const FormInputThreeColumn = function(props) {
  const { id, label, required, children } = props;
  return (
    <div className="form-input-col-3 form-input-container">
      <label htmlFor={id} className="control-label">
        {label}
        {required ? '*' : null}
      </label>
      {children}
    </div>
  );
};

export const FloatInput = props => {
  const { id, value } = props;

  const _onChange = ({ target: { value } }) => {
    const formatted = parseFloat(value);
    return props.onChange(formatted);
  };

  const formattedValue = value == null ? '' : parseFloat(value);

  return (
    <input
      key={id}
      className="form-control"
      value={formattedValue}
      type="number"
      onChange={_onChange}
    />
  );
};
