import styled from 'styled-components';
import { Stack, StackItem } from 'nr1';

export const GeoOpsContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
`;

export const DetailPanelItem = styled.div`
  display: block;
  border-bottom: 1px dotted #edeeee;
  padding: 8px 16px;
  list-style-type: none;
`;

export const MapContainer = styled(Stack)`
  height: calc(100% - 74px) !important;
  position: relative;
  overflow: hidden;
`;

export const DetailsPanelContainer = styled(StackItem)`
  width: 340px;
  height: 100%;
  position: absolute;
  right: 0;
  z-index: 1000;
  box-shadow: 0px 1px 0px rgba(0, 75, 82, 0.22),
    0px 3px 2px rgba(0, 49, 54, 0.1), 0px 1px 3px rgba(0, 134, 148, 0.13),
    0px 8px 17px rgba(88, 114, 117, 0.3);
  transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border-top: 1px solid #e3e4e4;

  &.closed {
    transform: translateX(100%);
  }

  &.minimized {
    transform: translateX(100%);
  }
`;

export const LocationsTableContainer = styled(StackItem)`
  width: 340px;
  height: 100%;
  position: relative;
  z-index: 1000;
  background-color: #fff;
  border-top: 1px solid #e3e4e4;

  .react-bootstrap-table {
    overflow: scroll;
  }

  .sortable:first-child {
    padding: 0;
  }
`;

export const PrimaryContentContainer = styled(StackItem)`
  width: 500px;
  height: 100%;
`;

export const AlertWarning = styled.div`
  display: flex;
  align-items: center;
  background-color: #fff7df;
  color: #8c732a;
  padding: 12px 16px 10px;
  border-bottom: 1px solid #f5edd6;

  :hover {
    cursor: pointer;
  }

  .ic-Icon {
    margin-right: 10px;
  }

  p {
    margin: 0;
    color: #8c732a;
    font-size: 12px;
    line-height: 18px;

    a {
      color: #8c732a;
      text-decoration: underline;
    }
  }
`;
