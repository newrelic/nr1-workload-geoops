import styled from 'styled-components';
import { StackItem } from 'nr1';

export const MetadataItemContainer = styled.li`
  margin: 0;
  display: block;
  border-bottom: 1px dotted #edeeee;
  padding: 8px 16px;
  list-style-type: none;
`;

export const MetadataItemKey = styled(StackItem)`
  width: 150px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-weight: 600;
  color: #464e4e;
  text-align: left;
`;

export const MetadataItemValue = styled(StackItem)`
  text-align: left;
  color: #464e4e;
  white-space: nowrap;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
`;
