import styled from 'styled-components';

export const StatusColor = styled.div`
  width: 8px;
  height: calc(100% + 1px);

  .status-ok & {
    background-color: #11a600;
  }

  .status-warning & {
    background-color: #ffd966;
  }

  .status-critical & {
    background-color: #bf0016;
  }

  .status-not-reporting & {
    background-color: #8e9494;
  }
`;

export const LocationTableContainer = styled.div`
  max-width: 47%;
  max-height: 300px;
  position: absolute;
  right: 1.5%;
  bottom: 2.75%;
  z-index: 1000;
  overflow: scroll;
  border-radius: 2px;
  box-shadow: 0px 1px 0px rgba(0, 75, 82, 0.17),
    0px 3px 2px rgba(0, 49, 54, 0.05), 0px 1px 3px rgba(0, 134, 148, 0.08),
    0px 8px 17px rgba(88, 114, 117, 0.25);

  &.no-data {
    width: 47%;
    background-color: #fff;
  }
`;
