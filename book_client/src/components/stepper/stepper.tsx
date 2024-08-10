import { useCallback, Fragment, useState, useMemo, JSX } from 'react';
import { clsx } from 'utils';
import './style.scss';

type StepperProps = {
  onSwitch: (step: number) => void;
  stepNumber: number;
  className?: string;
};

type StepType = {
  step: number;
  active: boolean;
  last: boolean;
  stepped: boolean;
};

type StepContentProps = {
  children: React.ReactElement;
};

export function StepContent({ children }: StepContentProps): JSX.Element {
  return (<>{children}</>);
};

function Stepper({ onSwitch, stepNumber, className }: StepperProps): JSX.Element {

  const stepsInit = useMemo<StepType[]>(() => {
    return Array.apply(null, Array(stepNumber))
      .map((_, index) => ({
        step: index + 1,
        active: index === 0,
        last: index + 1 === stepNumber,
        stepped: false
      }));
  }, [stepNumber]);

  const [steps, setSteps] = useState<StepType[]>(stepsInit);

  const onSwitchStep = useCallback((idx: number): void => {
    const stepsUpdated: StepType[] = steps.map(
      (step, index) => ({ ...step, active: index === idx, stepped: index <= idx - 1 }));
    setSteps(stepsUpdated);
    onSwitch(idx + 1);
  }, [steps]);

  return (
    <>
      <div className={clsx('stepper', className)}>
        {
          steps.map(({ step, active, last, stepped }, index) =>  (
            <Fragment key={index}>
              <div className={clsx('step-point', { 'active': active })} onClick={() => onSwitchStep(index)}>{step}</div>
              {!last && <div className={clsx('line', { 'line-active': stepped })} />}
            </Fragment>
          ))
        }
      </div>
    </>
  );
}

export default Stepper;
