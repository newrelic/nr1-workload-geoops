import styled from 'styled-components';

export const StepsList = styled.ul`
  display: flex;
  justify-content: center;
  padding: 24px 0;
  margin-bottom: 0;
  border-bottom: 1px dotted #e3e4e4;
`;

export const StepItem = styled.li`
  display: inline;
  position: relative;
  padding: 10px 14px 8px;
  color: ${({ isActive, isCompleted }) =>
    isActive || isCompleted ? '#fff' : '#005054'};
  transition: all 0.05s ease-out;
  margin-right: 6px;

  :hover {
    transform: ${({ isCompleted }) => isCompleted && 'translateY(-1px)'};
    cursor: ${({ isCompleted }) => isCompleted && 'pointer'};
  }

  :active {
    transform: translateY(1px);
  }

  :hover:before,
  :hover:after {
    box-shadow: ${({ isCompleted }) =>
      isCompleted && '0 2px 3px #00505446, 0 6px 15px 5px #00888f1d'};
    cursor: ${({ isCompleted }) => isCompleted && 'pointer'};
  }

  :before {
    content: '';
    position: absolute;
    top: 0px;
    right: 0;
    left: 0;
    width: 100%;
    height: 50%;
    transform: skew(20deg);
    background-color: ${({ isActive, isCompleted }) =>
      isActive || isCompleted ? '#007e8a' : '#d7f2f3'};
  }

  :after {
    content: '';
    position: absolute;
    right: 0;
    left: 0;
    bottom: 0.1px;
    width: 100%;
    height: 50%;
    transform: skew(-20deg);
    background-color: ${({ isActive, isCompleted }) =>
      isActive || isCompleted ? '#007e8a' : '#d7f2f3'};
  }

  :active:before,
  :active:after {
    box-shadow: ${({ isCompleted }) =>
      isCompleted && '0 0 3px #00505446, 0 4px 15px 5px #00888f1d'};
  }

  :first-child {
    margin-right: 12px;
    background-color: #007e8a;
    color: #fff;
    border-radius: 3px 0 0 3px;
    box-shadow: 0 1px 3px #00505454, 0 5px 15px 5px #00888f14;

    :before,
    :after {
      left: 5px;
      background-color: #007e8a;
      box-shadow: none;
    }

    :hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 3px #00505446, 0 6px 15px 5px #00888f1d;
      cursor: pointer;

      :before,
      :after {
        box-shadow: none;
      }
    }

    &:active {
      transform: translateY(1px);
      box-shadow: 0 0 3px #00505446, 0 4px 15px 5px #00888f1d;
    }
  }

  span {
    position: relative;
    z-index: 10;
    bottom: 1px;
    font-size: 14px;
  }
`;
