import styled from 'styled-components';
import { Stack, StackItem } from 'nr1';

export const MarkerPopupHeader = styled(Stack)`
  height: 30px;
  border-bottom: 1px solid #edeeee;
`;

export const StatusDotContainer = styled(StackItem)`
  height: 100%;
  padding: 0 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-right: 1px dotted #e3e4e4;

  span {
    display: block;
    border-radius: 20px;
    width: 9px;
    height: 9px;
    background-color: #13ba00;
  }
`;

export const TitleContainer = styled(StackItem)`
  display: flex;
  height: 100%;
  max-width: 63%;
  margin-left: 0;
  text-align: center;
  padding: 0 10px;
  justify-content: center;
  align-items: center;
  border-right: 1px dotted #e3e4e4;
  font-family: 'open sans';

  span {
    color: #2a3434;
    font-size: 14px;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const ComparisonContainer = styled(StackItem)`
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
  padding: 8px;
  margin: 0;

  span {
    padding: 2px 4px;
    background-color: #f2fcf3;
    color: #11a600;
    border-radius: 3px;
  }
`;

export const PopupDescription = styled.span`
  margin: 8px 10px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  box-sizing: border-box;
  line-height: 16px;
  font-size: 12px;
  color: #464e4e;
  font-family: 'open sans';

  a {
    color: #0079bf;
  }
`;
