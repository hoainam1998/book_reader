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
  const [value, setValue] = useState<typeof state>(state);
  const [dirty, setDirty] = useState<boolean>(false);

  const formControlProps: { [key: string]: any } = {
    validate: validateObject,
    handleSubmit: () => {
      if (!formControlProps.validate.dirty) {
        formControlProps.validate.dirty = true;
      }
      setDirty(true);
      formControlProps.validate.validate();
      Object.keys(formControlProps).forEach(key => {
        formControlProps[key] = Object.assign(formControlProps[key], validateObject[key]);
      });
    }
  };

  Object.keys(state).forEach((key: keyof StateType) => {
    formControlProps[key] = {
      value: value[key],
      onChange: <T>(event: ChangeEvent<T | any>) => {
        setValue({ ...value, [key]: event.currentTarget.value });
        state[key] = event.currentTarget.value;
        validateObject[key].validate();
      },
      onFocus: () => validateObject[key].dirty = true,
      ...validateObject[key],
      dirty,
    };
  });

  return formControlProps;
};
