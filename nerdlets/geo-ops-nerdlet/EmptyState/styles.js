import { Grid, GridItem, Stack, StackItem } from 'nr1';
import styled from 'styled-components';
import { ToolbarItem } from '../components';

export const StyledToolbarItem = styled(ToolbarItem)`
  font-size: 1.25em;
  color: #8e9494;
`;

export const StyledGrid = styled(Grid)`
  height: calc(100% - 74px);
`;

export const LeftGridItem = styled(GridItem)`
  overflow: scroll;
  overflow-x: hidden;
  background-color: #fff;
  box-shadow: 0px 1px 0px rgba(0, 75, 82, 0.17),
    0px 3px 2px rgba(0, 49, 54, 0.05), 0px 1px 3px rgba(0, 134, 148, 0.08),
    0px 8px 17px rgba(88, 114, 117, 0.25);
`;

export const RightGridItem = styled(GridItem)`
  position: relative;
`;

export const MapWrapper = styled.div`
  width: 100%;
  height: 100%;
`;

export const GetStartedWrapper = styled(Stack)`
  display: flex;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
`;

export const GetStartedPopover = styled(StackItem)`
  max-width: 440px;
  text-align: center;
  padding: 24px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0px 1px 0px rgba(0, 75, 82, 0.11),
    0px 3px 0px rgba(0, 49, 54, 0.04), 0px 1px 3px rgba(0, 134, 148, 0.03),
    0px 8px 7px rgba(70, 107, 111, 0.05);

  p {
    color: #8e9494;
  }

  hr {
    margin: 20px 0;
    border: none;
    border-top: 1px dotted #e3e4e4;
  }
`;
