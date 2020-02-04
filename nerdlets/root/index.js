import React, { Component } from 'react';
import { PlatformStateContext } from 'nr1';
import GeoOpsNerdlet from './root';

export default class index extends Component {
  render() {
    return (
      <PlatformStateContext.Consumer>
        {platformUrlState => (
          <GeoOpsNerdlet launcherUrlState={platformUrlState} />
        )}
      </PlatformStateContext.Consumer>
    );
  }
}
