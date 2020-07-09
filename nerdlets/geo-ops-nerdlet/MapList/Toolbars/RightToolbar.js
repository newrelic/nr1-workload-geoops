import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'nr1';

import { ToolbarItem } from '../../../shared/components';

const RightToolbar = ({ navigation }) => {
  return (
    <>
      <ToolbarItem>
        <Button
          type={Button.TYPE.PRIMARY}
          onClick={() =>
            navigation.router({
              to: 'createMap',
              state: { selectedMap: null, activeStep: 1 }
            })
          }
          iconType={Button.ICON_TYPE.INTERFACE__SIGN__PLUS}
        >
          New Map
        </Button>
      </ToolbarItem>
    </>
  );
};

RightToolbar.propTypes = {
  navigation: PropTypes.object
};

export default RightToolbar;
