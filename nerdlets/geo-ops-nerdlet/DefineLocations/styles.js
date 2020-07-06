import styled from 'styled-components';
import { JsonSchemaForm } from '../../shared/components';

export const FileUploadContainer = styled.div`
  text-align: center;

  p {
    text-align: center;
    color: #8e9494;
  }
`;

export const ManualDescription = styled.div`
  h4 {
    text-align: center;
    margin-bottom: 4px;
  }

  p {
    text-align: center;
    color: #8e9494;
  }
`;

export const OrLine = styled.div`
  display: flex;
  height: 1px;
  justify-content: center;
  align-items: center;
  margin: 36px 0;
  border: none;
  overflow: visible;
  border-top: 1px solid #e3e4e4;

  &:before {
    content: 'or';
    background-color: #fff;
    padding: 0 8px;
    text-align: Center;
    position: relative;
    bottom: 2px;
    color: #8e9494;
    font-style: italic;
  }
`;

export const StyledJsonSchemaForm = styled(JsonSchemaForm)`
  padding: 24px;
  border-radius: 4px;
  background-color: #fafbfb;
  border: 1px solid #e3e4e4;

  .form-group {
    margin-bottom: 16px;
  }
`;
