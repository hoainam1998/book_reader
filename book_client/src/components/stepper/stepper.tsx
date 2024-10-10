import {
  useCallback,
  useState,
  useEffect,
  useMemo,
  JSX,
  ReactElement,
  JSXElementConstructor,
  Children
} from 'react';
import List from 'components/list/list';
import { clsx, customError } from 'utils';
import './style.scss';

type StepperPropsType = {
  // eslint-disable-next-line no-unused-vars
  onSwitch: (step: number) => void;
  stepNumber: number;
  className?: string;
  activeStep: number;
  disableStep: number | false;
  children: ReactElement | ReactElement[];
};

type StepType = {
  step: number;
  active: boolean;
  last: boolean;
  stepped: boolean;
  disabled: boolean;
};

type StepContentPropsType = {
  children: ReactElement;
  step: number;
};

export function StepContent({ children }: StepContentPropsType): JSX.Element {
  return children;
};

const isStep = (child: ReactElement): boolean => {
  return (child.type as JSXElementConstructor<typeof StepContent>).name === StepContent.name
    && Object.hasOwn(child, 'props')
    && child.props.step > 0;
};

function Stepper({
  stepNumber,
  className,
  children,
  activeStep,
  disableStep,
  onSwitch
}: StepperPropsType): JSX.Element {
  const stepsInit = useMemo<StepType[]>(() => {
    return Array.apply(null, Array(stepNumber))
      .map((_, index) => ({
        step: index + 1,
        active: index === activeStep - 1,
        last: index + 1 === stepNumber,
        stepped: index <= activeStep - 2,
        disabled: disableStep === false ? disableStep : index >= disableStep - 1
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
      .sort((a): number => isStep(a) ? -1 : 1)
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
        : stepValidate(child, uniqueStep))[step - 1];
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
        <List<StepType> items={steps} render={({ step, active, disabled, last, stepped }, index) =>
          <>
            <div className={clsx('step-point', { 'active': active, 'disabled': disabled })}
              onClick={() => onSwitchStep(index)}>
                {step}
              </div>
            {!last && <div className={clsx('line', { 'line-active': stepped })} />}
          </>
        } />
      </div>
      { currentStep }
    </>
  );
}

export default Stepper;
