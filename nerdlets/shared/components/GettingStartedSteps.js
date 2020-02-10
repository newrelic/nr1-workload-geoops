import React from 'react';
import PropTypes from 'prop-types';

const Step = function({ title, isActive }) {
  const activeClass = 'active-step';
  const label = !isActive ? title : `${title} (Active)`;

  return <li className={isActive ? activeClass : null}>{label}</li>;
};
Step.propTypes = {
  title: PropTypes.string,
  isActive: PropTypes.bool
};

const GettingStartedSteps = function({ steps, activeStep }) {
  return (
    <>
      <ul>
        {steps.map((s, index) => (
          <Step
            key={index}
            title={s.title}
            isActive={s.order === activeStep.order}
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
  activeStep: StepPropType
};

export default GettingStartedSteps;
