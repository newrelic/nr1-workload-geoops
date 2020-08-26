import styled from 'styled-components';

import { ToolbarItem } from '../../components';

export const StyledToolbarItem = styled(ToolbarItem)`
  flex-direction: column;
  align-items: flex-start;

  > span {
    margin-bottom: 7px;
    letter-spacing: 1.25px;
    text-transform: uppercase;
    color: #8e9494;
    font-size: 10px;
  }

  > h4 {
    max-width: 308px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    font-size: 20px;
    text-transform: none;
    color: #464e4e;
  }
`;
