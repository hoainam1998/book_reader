/* eslint-disable no-unused-vars */
import { ChangeEvent, useState, } from 'react';
import { validateHelper, ValidateFunction, ValidateProcess } from 'utils';

type StateType = { [key: string]: any };
type RuleType = {
  [key: string]: {
    [key: string]: ValidateFunction | ValidateProcess
  }
};

export default (state: StateType, rules: RuleType & ArrayLike<RuleType>) => {
  const validateObject = validateHelper<StateType, RuleType>(state, rules);

  const formControlProps: { [key: string]: any } = {
    validate: validateObject,
    handleSubmit: () => {
      if (!formControlProps.validate.dirty) {
        formControlProps.validate.dirty = true;
        formControlProps.validate.validate();
      } else {
        // return 'value';
      }
    }
  };
  const [value, setValue] = useState<typeof state>(state);

  Object.keys(state).forEach((key: keyof StateType) => {
    formControlProps[key] = {
      value: value[key],
      onChange: <T>(event: ChangeEvent<T | any>) => {
        setValue({ ...value, [key]: event.currentTarget.value });
        state[key] = event.currentTarget.value;
        validateObject[key].validate();
      },
      onFocus: () => validateObject[key].dirty = true,
      ...validateObject[key]
    };
  });

  return formControlProps;
};
