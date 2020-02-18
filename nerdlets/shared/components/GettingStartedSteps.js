import React from 'react';
import PropTypes from 'prop-types';

const Step = function({ title, isActive, onClick }) {
  const activeClass = 'active-step';
  const label = !isActive ? title : `${title}`;

  return (
    <li
      onClick={onClick}
      className={`get-started-step ${isActive ? activeClass : ''}`}
    >
      <span>{label}</span>
    </li>
  );
};
Step.propTypes = {
  title: PropTypes.string,
  isActive: PropTypes.bool,
  onClick: PropTypes.func
};

const GettingStartedSteps = function({ steps, activeStep, tempNavigation }) {
  return (
    <>
      <ul className="get-started-steps-container">
        {steps.map((s, index) => (
          <Step
            key={index}
            title={s.title}
            isActive={s.order === activeStep.order}
            onClick={() => tempNavigation(s.order)}
          />
        ))}
      </ul>
    </>
  );
};

/*
 * Prop Types
 */
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
