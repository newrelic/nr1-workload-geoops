import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'nr1';

import { ToolbarItem } from '../../components';

const RightToolbar = ({ navigation }) => {
  return (
    <>
      <ToolbarItem hasSeparator>
        <Button
          type={Button.TYPE.NORMAL}
          onClick={() => navigation.router({ to: 'createMap' })}
          iconType={Button.ICON_TYPE.INTERFACE__SIGN__PLUS}
        >
          New Map
        </Button>
      </ToolbarItem>
      <ToolbarItem>
        <Button
          type={Button.TYPE.NORMAL}
          onClick={() => navigation.router({ to: 'mapList' })}
          iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__GROUP}
        >
          View all maps
        </Button>
      </ToolbarItem>
    </>
  );
};

RightToolbar.propTypes = {
  navigation: PropTypes.object
};

export default RightToolbar;
