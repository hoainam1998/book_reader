import { useCallback, Fragment, useState, useMemo, JSX, ReactElement, JSXElementConstructor, Children, ReactNode } from 'react';
import { clsx } from 'utils';
import './style.scss';

type StepperProps = {
  onSwitch: (step: number) => void;
  stepNumber: number;
  className?: string;
  children: React.ReactElement | React.ReactElement[];
};

type StepType = {
  step: number;
  active: boolean;
  last: boolean;
  stepped: boolean;
};

type StepContentProps = {
  children: React.ReactElement;
  step: number;
};

const isStep = (child: ReactElement): boolean => {
  return (child.type as JSXElementConstructor<typeof StepContent>).name === StepContent.name
    && Object.hasOwn(child, 'props')
    && child.props.step > 0;
};

export function StepContent({ children }: StepContentProps): JSX.Element {
  return (<>{children}</>);
};

function Stepper({ onSwitch, stepNumber, className, children }: StepperProps): JSX.Element {

  const childrenList = useMemo<ReactElement[]>(() => {
    const indexes: number[] = Array.apply(null, Array(stepNumber)).map((_, index) => index);
    return (Children.toArray(children) as ReactElement[]).map((child) => {
      if (isStep(child)) {
        const order: number = child.props.step - 1;
        indexes.splice(order, 1);
        return child;
      } else {
        const step: number = indexes[0] + 1;
        indexes.splice(0, 1);
        return <StepContent step={step}>{child}</StepContent>
      }
    }).sort((a, b): number => {
      if (a.props.step === b.props.step) {
        return a.props.step - (b.props.step + 1);
      }
      return a.props.step - b.props.step;
    });
  }, [children]);

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
      {
        childrenList.map((children, index) => (<Fragment key={index}>{children}</Fragment>))
      }
    </>
  );
}

export default Stepper;
