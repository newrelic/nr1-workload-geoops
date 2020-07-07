import styled from 'styled-components';
import { Button, Grid, GridItem, Stack, StackItem } from 'nr1';

export const StyledGrid = styled(Grid)`
  overflow: hidden;
  height: 100%;

  button[type='submit'] {
    display: none;
  }

  .map-entities-to-locations-container button[type='submit'] {
    display: inline;
  }
`;

export const AllMapsButton = styled(Button)`
  position: absolute;
  z-index: 1000;
  top: 16px;
  right: 16px;
`;

export const LocationsTable = styled(GridItem)`
  overflow: scroll;
  overflow-x: hidden;
  background-color: #fff;
  box-shadow: 0px 1px 0px rgba(0, 75, 82, 0.17),
    0px 3px 2px rgba(0, 49, 54, 0.05), 0px 1px 3px rgba(0, 134, 148, 0.08),
    0px 8px 17px rgba(88, 114, 117, 0.25);
`;

export const MapContainer = styled(GridItem)`
  width: 100%;
  height: 100%;
`;

export const StepContainer = styled(Stack)`
  display: flex;
  justify-content: space-between !important;
  flex-direction: column;
  padding-top: 24px;
  min-height: calc(100% - 86px);
  margin: 0 auto;

  h1 {
    text-align: center;
    font-weight: 400;
    margin-bottom: 24px;
  }
`;

export const FormContainer = styled(Stack)`
  width: 85%;
  display: flex;
  flex-direction: column;
`;

export const FooterContainer = styled(StackItem)`
  width: 100%;
  background-color: #fafbfb;
  box-shadow: 0 -1px 0 #e3e4e4, 0 -1px 20px rgba(0, 0, 0, 0.1);
  margin-left: 0;
  position: sticky;
  left: 0;
  bottom: 0;
`;

export const FooterButtonsContainer = styled(Stack)`
  width: 100%;
  height: 70px;
  box-sizing: border-box;
  justify-content: space-between !important;
  padding: 0 16px;
`;

export const StyledButton = styled(Button)`
  flex-direction: row-reverse;

  span.ic-Icon {
    margin-left: 8px;
    margin-right: 0;
    position: relative;
    bottom: 1px;
  }
`;
