import React from 'react';
import { shallow } from 'enzyme';
import { Stack, StackItem } from 'nr1';
import LocationMetadata from '../LocationMetadata';
import { locationExample } from './mocks';
import '../../../setupTests';

const wrapper = shallow(<LocationMetadata />);

describe('#LocationMetadata', () => {
  test('should render component without error if no params are passed', () => {
    expect(!!wrapper).toBe(true);
  });

  test('should render component without error valid location data has been passed', () => {
    wrapper.setProps({ activeMapLocation: locationExample });
    expect(!!wrapper).toBe(true);
  });

  test('should render nested Stack components if valid location data has been passed', () => {
    wrapper.setProps({ activeMapLocation: locationExample });
    expect(!!wrapper.find(Stack)).toBe(true);
  });

  test('should render nested StackItem components if valid location data has been passed', () => {
    wrapper.setProps({ activeMapLocation: locationExample });
    expect(!!wrapper.find(StackItem)).toBe(true);
  });
});
