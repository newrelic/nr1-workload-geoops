import { Stack, StackItem } from 'nr1';
import styled from 'styled-components';
import ToolbarItem from './ToolbarItem';

export const StyledStack = styled(Stack)`
  height: 74px;
  box-sizing: border-box;
  border-top: 1px solid #dbdddd;
  border-bottom: 1px solid #e3e4e4;
  background: #edeeee;
  padding: 0 16px;
`;

export const LeftStackItem = styled(StackItem)`
  ${ToolbarItem}:first-child {
    padding-left: 0;
  }
`;

export const RightStackItem = styled(StackItem)`
  ${ToolbarItem}:last-child {
    padding-right: 0;
  }
`;
