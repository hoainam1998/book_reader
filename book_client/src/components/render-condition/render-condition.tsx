import { JSX, ReactNode } from 'react';

type RenderConditionPropsType = {
  condition: boolean;
  then: ReactNode;
  not?: ReactNode;
};

function RenderCondition({ condition, then, not }: RenderConditionPropsType): JSX.Element {
  return (<>{condition ? then: not}</>);
}

export default RenderCondition;
