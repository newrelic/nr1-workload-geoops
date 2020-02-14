import React from 'react';

// https://react-jsonschema-form.readthedocs.io/en/latest/advanced-customization/#field-template

export const FormInputFullWidth = function(props) {
  // eslint-disable-next-line react/prop-types
  const { id, label, required, children } = props;
  return (
    <div className="form-input-col-12">
      <label htmlFor={id}>
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
    <div className="form-input-col-6">
      <label htmlFor={id}>
        {label}
        {required ? '*' : null}
      </label>
      {children}
    </div>
  );
};
