import React from 'react';
import { shallow } from 'enzyme';
import Timeline from '../Timeline';
import { locationExample } from './mocks';
import '../../../setupTests';

const wrapper = shallow(<Timeline />);

describe('#Timeline', () => {
  test('should render component without errors if no params are passed', () => {
    expect(!!wrapper).toBe(true);
  });

  test('should render component without errors valid location data has been passed', () => {
    wrapper.setProps({ activeMapLocation: locationExample });
    expect(!!wrapper).toBe(true);
  });
});
