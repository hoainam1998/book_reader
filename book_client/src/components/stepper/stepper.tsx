import {
  useCallback,
  Fragment,
  useState,
  useEffect,
  useMemo,
  JSX,
  ReactElement,
  JSXElementConstructor,
  Children
} from 'react';
import { clsx, customError } from 'utils';
import './style.scss';

type StepperPropsType = {
  onSwitch: (step: number) => void;
  stepNumber: number;
  className?: string;
  activeStep: number;
  children: React.ReactElement | React.ReactElement[];
};

type StepType = {
  step: number;
  active: boolean;
  last: boolean;
  stepped: boolean;
};

type StepContentPropsType = {
  children: React.ReactElement;
  step: number;
};

const isStep = (child: ReactElement): boolean => {
  return (child.type as JSXElementConstructor<typeof StepContent>).name === StepContent.name
    && Object.hasOwn(child, 'props')
    && child.props.step > 0;
};

export function StepContent({ children }: StepContentPropsType): JSX.Element {
  return children;
};

function Stepper({ onSwitch, stepNumber, className, children, activeStep }: StepperPropsType): JSX.Element {
  const stepsInit = useMemo<StepType[]>(() => {
    return Array.apply(null, Array(stepNumber))
      .map((_, index) => ({
        step: index + 1,
        active: index === activeStep - 1,
        last: index + 1 === stepNumber,
        stepped: index <= activeStep - 2
      }));
  }, [stepNumber, activeStep]);

  const [steps, setSteps] = useState<StepType[]>(stepsInit);
  const [step, setStep] = useState<number>(1);

  const stepValidate = useCallback((children: ReactElement, uniqueStep: number[]): ReactElement => {
    const step: number = children.props.step;

    if (step > stepNumber) {
      throw customError('Step exceed step number!');
    }

    if (uniqueStep.includes(step)) {
      throw customError('Duplicate step order!');
    } else {
      uniqueStep.push(step);
    }

    return children;
  }, []);

  const currentStep = useMemo<ReactElement>(() => {
    const indexes: number[] = Array.apply(null, Array(stepNumber)).map((_, index) => index);
    const uniqueStep: number[] = [];

    return (Children.toArray(children) as ReactElement[])
      .sort((a, _): number => isStep(a) ? -1 : 1)
      .map(child => {
        if (isStep(child)) {
          const order: number = child.props.step - 1;
          indexes.splice(order, 1);
          return {
            step: child.props.step,
            child,
            isStepComponent: true
          };
        } else {
          const step: number = indexes[0] + 1;
          indexes.splice(0, 1);
          return {
            step,
            child,
            isStepComponent: false
          };
        }
      })
      .sort((a, b): number => a.step - b.step)
      .map(({ child, isStepComponent, step }) => !isStepComponent
        ? stepValidate(<StepContent step={step}>{child}</StepContent>, uniqueStep)
        : stepValidate(child, uniqueStep))
      [step - 1];
  }, [children, step]);

  const onSwitchStep = useCallback((idx: number): void => {
    const stepsUpdated: StepType[] = steps.map(
      (step, index) => ({ ...step, active: index === idx, stepped: index <= idx - 1 }));
    const switchedStep = idx + 1;
    setSteps(stepsUpdated);
    onSwitch(switchedStep);
    setStep(switchedStep);
  }, [steps]);

  useEffect(() => {
    if (activeStep <= 0) {
      throw customError('Step must start equal 1!');
    } else {
      setStep(activeStep);
      setSteps(stepsInit);
    }
  }, [activeStep]);

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
      { currentStep }
    </>
  );
}

export default Stepper;
