import React from 'react';
import PropTypes from 'prop-types';
import { Stack, StackItem } from 'nr1';
import styled from 'styled-components';
import ToolbarItem from './ToolbarItem';

const StyledStack = styled(Stack)`
  height: 74px;
  box-sizing: border-box;
  border-top: 1px solid #dbdddd;
  border-bottom: 1px solid #e3e4e4;
  background: #edeeee;
  padding: 0 16px;
`;

const LeftStackItem = styled(StackItem)`
  ${ToolbarItem}:first-child {
    padding-left: 0;
  }
`;

const RightStackItem = styled(StackItem)`
  ${ToolbarItem}:last-child {
    padding-right: 0;
  }
`;

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
