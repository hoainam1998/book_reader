/* eslint-disable no-unused-vars */
import { ChangeEvent, useState } from 'react';

type StateType = { [key: string]: any };

export default (state: StateType, rules: any) => {
  const formControlProps: { [key: string]: any } = {};
  const [value, setValue] = useState<typeof state.key>('');

  Object.keys(state).forEach((key: keyof StateType) => {
    formControlProps[key] = {
      value,
      onChange: <T>(event: ChangeEvent<T | any>) => {
        setValue(event.currentTarget.value);
        state.key = event.currentTarget.value;
      }
    };
  });

  return formControlProps;
};
