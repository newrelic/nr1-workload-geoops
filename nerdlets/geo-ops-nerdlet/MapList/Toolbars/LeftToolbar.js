import React from 'react';
import styled from 'styled-components';

import { ToolbarItem } from '../../../shared/components/Toolbar';

const StyledToolbarItem = styled(ToolbarItem)`
  h4 {
    margin-bottom: 0;
    font-size: 20px;
    line-height: 71px;
    text-transform: none;
    color: #464e4e;
  }
`;

const LeftToolbar = () => {
  return (
    <>
      <StyledToolbarItem>
        <h4>My maps</h4>
      </StyledToolbarItem>
    </>
  );
};

export default LeftToolbar;
