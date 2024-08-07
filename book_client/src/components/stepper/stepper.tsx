import { useCallback, Fragment, useState } from 'react';
import { clsx } from 'utils';
import './style.scss';

type StepType = {
  step: number;
  active: boolean;
  last: boolean;
  stepped: boolean;
};

const stepsInit: StepType[] = [
  {
    step: 1,
    active: true,
    last: false,
    stepped: false,
  },
  {
    step: 2,
    active: false,
    last: true,
    stepped: false,
  }
];

function Stepper(): JSX.Element {
  const [steps, setSteps] = useState<StepType[]>(stepsInit);

  const onSwitchStep = useCallback((idx: number): void => {
   const stepsUpdated: StepType[] = steps.map(
    (step, index) => ({ ...step, active: index === idx, stepped: index === idx - 1 }));
   setSteps(stepsUpdated);
  }, [steps]);

  return (
    <div className="stepper">
      {
        steps.map(({ step, active, last, stepped }, index) =>  (
          <Fragment key={index}>
            <div className={clsx('step-point', { 'active': active })} onClick={() => onSwitchStep(index)}>{step}</div>
            {!last && <div className={clsx('line', { 'line-active': stepped })} /> }
          </Fragment>
        ))
      }
    </div>
  );
}

export default Stepper;
