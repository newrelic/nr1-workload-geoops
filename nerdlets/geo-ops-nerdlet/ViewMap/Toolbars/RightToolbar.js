import React from 'react';
import PropTypes from 'prop-types';

import { Button, StackItem } from 'nr1';

const RightToolbar = ({ navigation }) => {
  return (
    <>
      <StackItem className="toolbar-item has-separator">
        <Button
          type={Button.TYPE.NORMAL}
          onClick={() => navigation.router({ to: 'createMap' })}
          iconType={Button.ICON_TYPE.INTERFACE__SIGN__PLUS}
        >
          New Map
        </Button>
      </StackItem>
      <StackItem className="toolbar-item">
        <Button
          type={Button.TYPE.NORMAL}
          onClick={() => navigation.router({ to: 'mapList' })}
          iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__GROUP}
        >
          View all maps
        </Button>
      </StackItem>
    </>
  );
};

RightToolbar.propTypes = {
  navigation: PropTypes.object
};

export default RightToolbar;
