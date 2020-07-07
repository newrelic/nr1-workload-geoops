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
