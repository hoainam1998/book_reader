import { ChangeEvent, useState, } from 'react';
import useValidate, { ValidateFunction, ValidateProcess } from './useValidate';

export type StateType = { [key: string]: any };

export type RuleType = {
  [key: keyof StateType]: {
    [key: string]: ValidateFunction | ValidateProcess
  }
};

export default (state: StateType, rules: RuleType & ArrayLike<RuleType>, formId: string) => {
  const validateObject = useValidate<StateType, RuleType>(state, rules);
  const [value, setValue] = useState<typeof state>(state);

  const formControlProps: { [key: string]: any } = {
    validate: validateObject,
    handleSubmit: () => {
      if (!formControlProps.validate.dirty) {
        formControlProps.validate.dirty = true;
      }
      formControlProps.validate.validate();
      Object.keys(formControlProps).forEach(key => {
        formControlProps[key] = Object.assign(formControlProps[key], validateObject[key]);
      });
    },
    reset: () => {
      Object.keys(state).forEach(key => validateObject[key].dirty = false);
      validateObject.dirty = false;
      validateObject.validate();
      document.forms.namedItem(formId)?.reset();
    }
  };

  Object.keys(state).forEach((key: keyof StateType) => {
    formControlProps[key] = {
      value: value[key],
      onChange: <T>(arg: ChangeEvent<T | any> | T | any): void => {
        const currentValue =
          arg.currentTarget?.value === null || arg.currentTarget?.value === undefined
            ? arg
            : arg.currentTarget?.value;
        setValue({ ...value, [key]: currentValue });
        state[key] = currentValue;
        validateObject[key].validate();
      },
      onFocus: (): void => {
        validateObject[key].dirty = true;
      },
      ...validateObject[key],
      watch: <T>(currentValue: T): void => {
        formControlProps[key].value = currentValue;
        setValue({ ...value, [key]: currentValue });
        state[key] = currentValue;
        validateObject.validate();
      }
    };
  });

  return formControlProps;
};
