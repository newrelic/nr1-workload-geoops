import React from 'react';

function _MockedComponent(props) {
  return <div {...props} />;
}

export const Stack = _MockedComponent;
export const StackItem = _MockedComponent;
const _Icon = _MockedComponent;
_Icon.TYPE = {};
export const Icon = _Icon;
