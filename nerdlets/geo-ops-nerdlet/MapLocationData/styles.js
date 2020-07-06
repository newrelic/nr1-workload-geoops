import styled from 'styled-components';
import { Stack, StackItem } from 'nr1';

import { JsonSchemaForm } from '../../shared/components';

export const Description = styled.div`
  h4 {
    text-align: center;
    margin-bottom: 4px;
  }

  p {
    text-align: center;
    color: #8e9494;
  }
`;

export const MapEntitiesHeader = styled(Stack)`
  display: flex;
  justify-content: space-between !important;
  background-color: #f4f5f5;
  border-radius: 4px 4px 0 0;
  width: 100%;
  border: 1px solid #d5d7d7;
  height: 30px;
`;

export const ProgressBarContainer = styled(StackItem)`
  display: flex;
  height: 100%;
  align-items: center;
  padding: 0 8px;

  > span {
    font-size: 12px;
    color: #8e9494;
    font-variant-numeric: tabular-nums;
  }
`;

export const ProgressBar = styled.div`
  width: 200px;
  height: 6px;
  margin-right: 8px;
  background-color: #d5d7d7;
  border-radius: 10px;
`;

export const ProgressBarFill = styled.div`
  width: ${({ progress }) => progress};
  height: 6px;
  background-color: #007e8a;
  border-radius: 10px;
`;

export const ArrowsContainer = styled(StackItem)`
  display: flex;
  flex-direction: row;
`;

export const EntitiesList = styled.ul`
  height: 160px;
  overflow: scroll;
  border-left: 1px solid #d5d7d7;
  border-right: 1px solid #d5d7d7;
  margin-bottom: 0;
  list-style-type: none;
`;

export const Entity = styled.li`
  padding: 10px 8px;
  border-bottom: 1px solid #edeeee;

  :hover {
    cursor: pointer;
    background-color: ${({ isActive }) => (isActive ? '#f4f5f5' : '#fafbfb')};
  }

  :hover {
    .map-entities-location-list-item-check {
      box-shadow: inset 0 0 0 2px #b9bdbd;
    }
  }

  ${({ isActive }) =>
    isActive &&
    `position: relative;
  z-index: 100;
  background-color: #f4f5f5;
`}
`;

export const EntityTitle = styled(StackItem)`
  margin-right: 4px;
  font-size: 14px;
  font-weight: 600;
  color: #464e4e;

  ${({ isActive }) => isActive && 'color: #000d0d;'}

  ${({ isCompleted }) =>
    isCompleted &&
    `color: #8e9494;
  text-decoration: line-through;
`}
`;

export const EntityCheck = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 100px;
  box-shadow: ${({ isCompleted, isActive }) =>
    isActive && !isCompleted
      ? 'inset 0 0 0 2px #000d0d'
      : 'inset 0 0 0 2px #d5d7d7'};

  ${({ isCompleted }) =>
    isCompleted &&
    `background-color: #007e8a;
    box-shadow: none;
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAVCAYAAABYHP4bAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACqSURBVHgB7dTNDYMwDAVgj9AROkI3ajZpN+gIHaGjMEJH4ML/5WEjkCxkBFJsTjzJJ0g+R7FCFBgAN4pOD7w6oAjFBGlZkArDNKIx8oyFSNXAm7xyIech/OP9yDhmI1z/vdnfQrjSYUQt+rojJXe/QkwsC1EnStYmDfCR7wPwzEaWVMCDNy6NJ+TnhuxhrojGNu4McxOJvGJM4YRIE+QdjYUhGmOkCEU8MwJ6WU8SrbeehQAAAABJRU5ErkJggg==');
    background-size: 50%;
    background-position: 5px center;
    background-repeat: no-repeat;
  `}
`;

export const EntityDescription = styled(StackItem)`
  margin-left: 0;
  color: ${({ isCompleted, isActive }) =>
    isCompleted || isActive ? '#8e9494' : '#464e4e'};

  :before {
    content: ' - ';
  }

  text-decoration: ${({ isCompleted }) => isCompleted && 'line-through'};
`;

export const Button = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 28px;
  background-color: transparent;
  border: none;
  border-left: 1px solid #d5d7d7;

  &:hover {
    background-color: #edeeee;
  }

  &:active {
    background-color: #e3e4e4;

    .ic-Icon {
      bottom: 0;
    }
  }

  .ic-Icon {
    position: relative;
    bottom: 1px;
    pointer-events: none;
  }
`;

export const StyledJsonSchemaForm = styled(JsonSchemaForm)`
  background-color: #f4f5f5;
  padding: 16px;
  border-radius: 0 0 4px 4px;
  border: 1px solid #d5d7d7;
  border-top-color: #e3e4e4;

  .form-group {
    margin-bottom: 16px;
  }

  .field-object {
    margin-bottom: 0;

    & + div {
      text-align: center;
    }
  }

  .btn {
    color: #fff;
    background-color: #007e8a;
    display: inline-block !important;
    text-align: center;
  }
`;
