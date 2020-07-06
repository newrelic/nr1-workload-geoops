import styled from 'styled-components';
import { Tooltip } from 'nr1';

export const H6 = styled.h6`
  white-space: nowrap;
  margin-bottom: 0;
  font-size: 12px;
  color: #2a3434;
`;

export const StyledTooltip = styled(Tooltip)`
  max-width: 214px;
  position: relative;
  bottom: 3px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  font-size: 10px;
  font-family: 'fira code', 'open source sans', monospace;
  color: #007e8a;
  background-color: #ecf6f6;
  padding: 4px 4px 3px;
  border-radius: 4px;

  &:hover {
    cursor: pointer;
    color: #005054;
    background-color: #d3efef;
  }
`;
