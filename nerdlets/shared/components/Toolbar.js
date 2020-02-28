import React from 'react';
import PropTypes from 'prop-types';

import { Stack, StackItem } from 'nr1';

const Toolbar = function({ className, left, right }) {
  return (
    <Stack
      className={`toolbar-container ${className}`}
      fullWidth
      gapType={Stack.GAP_TYPE.NONE}
      horizontalType={Stack.HORIZONTAL_TYPE.FILL_EVENLY}
      verticalType={Stack.VERTICAL_TYPE.FILL}
    >
      <StackItem className="toolbar-section1">
        <Stack
          gapType={Stack.GAP_TYPE.NONE}
          fullWidth
          fullHeight
          verticalType={Stack.VERTICAL_TYPE.FILL}
        >
          {left || (
            <StackItem>
              <div />{' '}
            </StackItem>
          )}
        </Stack>
      </StackItem>
      <StackItem className="toolbar-section2">
        <Stack
          fullWidth
          fullHeight
          verticalType={Stack.VERTICAL_TYPE.CENTER}
          horizontalType={Stack.HORIZONTAL_TYPE.RIGHT}
        >
          {right || (
            <StackItem>
              <div />
            </StackItem>
          )}
        </Stack>
      </StackItem>
    </Stack>
  );
};

Toolbar.propTypes = {
  className: PropTypes.string,
  left: PropTypes.element,
  right: PropTypes.element
};

export default Toolbar;
