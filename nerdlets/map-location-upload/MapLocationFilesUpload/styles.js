import styled from 'styled-components';
import { Stack, StackItem } from 'nr1';

export const FileUploadContainer = styled(Stack)`
  margin-bottom: 16px;
`;

export const Description = styled.p`
  margin-bottom: 0 !important;
`;

export const Label = styled.label`
  margin-bottom: 0;
  padding: 8px 16px;
  position: relative;
  top: 8px;
  background-color: #007e8a;
  color: #fff;
  font-size: 12px;
  border-radius: 3px;
  transition: background-color 125ms ease;
  white-space: nowrap;

  :hover {
    cursor: pointer;
    background-color: #0095a4;
  }

  :active {
    background-color: #006771;
  }
`;

export const LabelGray = styled(Label)`
  background-color: #edeeee;
  color: #2a3434;

  &:hover {
    background-color: #d5d7d7;
  }

  &:active {
    background-color: #b9bdbd;
  }
`;

export const ButtonsContainer = styled(StackItem)`
  > * {
    margin-left: 8px;
  }
`;

export const Input = styled.input`
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
`;
