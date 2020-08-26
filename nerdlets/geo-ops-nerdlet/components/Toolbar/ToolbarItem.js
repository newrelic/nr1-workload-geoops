import styled from 'styled-components';

import { StackItem } from 'nr1';

const ToolbarItem = styled(StackItem)`
  display: flex;
  justify-content: center;
  padding: 8px 16px;
  align-items: center;

  padding-right: ${({ hasSeparator }) => !hasSeparator && 0};
  border-right: ${({ hasSeparator }) => hasSeparator && '1px dotted #d5d7d7'};
`;

export default ToolbarItem;
