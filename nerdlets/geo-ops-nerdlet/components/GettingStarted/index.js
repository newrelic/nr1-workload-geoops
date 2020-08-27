import React from 'react';
import PropTypes from 'prop-types';
import { StepsList, StepItem } from './styles';

const Step = function({ title, isActive, onClick, isCompleted }) {
  const label = !isActive ? title : `${title}`;

  return (
    <StepItem onClick={onClick} isCompleted={isCompleted} isActive={isActive}>
      <span>{label}</span>
    </StepItem>
  );
};

Step.propTypes = {
  title: PropTypes.string,
  isActive: PropTypes.bool,
  onClick: PropTypes.func,
  isCompleted: PropTypes.bool
};

const GettingStartedSteps = ({ steps, activeStep, tempNavigation }) => (
  <StepsList>
    {steps.map((s, index) => (
      <Step
        key={index}
        title={s.title}
        isActive={s.order === activeStep.order}
        isCompleted={s.order < activeStep.order}
        onClick={() => tempNavigation(s.order)}
      />
    ))}
  </StepsList>
);

const StepPropType = PropTypes.shape({
  order: PropTypes.number,
  title: PropTypes.string
});

GettingStartedSteps.propTypes = {
  steps: PropTypes.arrayOf(StepPropType),
  activeStep: StepPropType,
  tempNavigation: PropTypes.func
};

export default GettingStartedSteps;
