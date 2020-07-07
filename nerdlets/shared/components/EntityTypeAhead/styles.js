import styled from 'styled-components';

export const MultiValueRemove = styled.div`
  width: 22px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-left: 1px solid #7fcdd5;

  &:hover {
    cursor: pointer;
    background-color: rgb(228, 245, 245);
  }

  [class*='IndicatorsContainer'] & {
    border: none;
    transform: scale(1.25);
    opacity: 0.75;
    height: 18px;
    position: relative;
    right: 9px;
    width: 18px;
    background-color: #007e8a1a;
    border-radius: 100px;

    svg {
      position: relative;
      right: 0.5px;
    }
  }
`;
