import React from 'react';

// https://react-jsonschema-form.readthedocs.io/en/latest/advanced-customization/#field-template

export const FormInputFullWidth = function(props) {
  // eslint-disable-next-line react/prop-types
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
  // eslint-disable-next-line react/prop-types
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
  // eslint-disable-next-line react/prop-types
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
