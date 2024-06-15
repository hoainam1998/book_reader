/* eslint-disable no-unused-vars */
import { ChangeEvent, useState } from 'react';
import { validate } from 'utils';

type StateType = { [key: string]: any };

export default (state: StateType, rules: any) => {
  const validateObject = validate(state, rules);
  const formControlProps: { [key: string]: any } = {
    validate: validateObject,
    handleSubmit: () => {
      if (!formControlProps.validate.dirty) {
        formControlProps.validate.dirty = true;
      } else {
        return 'value';
      }
    }
  };
  const [value, setValue] = useState<typeof state>(state);

  Object.keys(state).forEach((key: keyof StateType) => {
    formControlProps[key] = {
      value: value[key],
      onChange: <T>(event: ChangeEvent<T | any>) => {
        setValue({ ...value, [key]: event.currentTarget.value });
        validateObject[key].validate();
        state[key] = event.currentTarget.value;
      }
    };
  });

  return formControlProps;
};
