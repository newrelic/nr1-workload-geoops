import React from 'react';
import PropTypes from 'prop-types';
import { Stack } from 'nr1';
import { StyledStack, LeftStackItem, RightStackItem } from './styles';

const Toolbar = ({ className, left, right }) => (
  <StyledStack
    className={className}
    fullWidth
    gapType={Stack.GAP_TYPE.NONE}
    horizontalType={Stack.HORIZONTAL_TYPE.FILL_EVENLY}
    verticalType={Stack.VERTICAL_TYPE.FILL}
  >
    <LeftStackItem>
      <Stack
        gapType={Stack.GAP_TYPE.NONE}
        fullWidth
        fullHeight
        verticalType={Stack.VERTICAL_TYPE.FILL}
      >
        {left}
      </Stack>
    </LeftStackItem>
    {right && (
      <RightStackItem>
        <Stack
          gapType={Stack.GAP_TYPE.NONE}
          fullWidth
          fullHeight
          verticalType={Stack.VERTICAL_TYPE.FILL}
          horizontalType={Stack.HORIZONTAL_TYPE.RIGHT}
        >
          {right}
        </Stack>
      </RightStackItem>
    )}
  </StyledStack>
);

Toolbar.propTypes = {
  className: PropTypes.string,
  left: PropTypes.element,
  right: PropTypes.element
};

export default Toolbar;
