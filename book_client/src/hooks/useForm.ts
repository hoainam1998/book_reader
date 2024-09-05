import { ChangeEvent } from 'react';
import useValidate, {
  ValidateFunction,
  ValidateProcess,
  ErrorInfo,
  ValidateInfo,
  ValidateName
} from './useValidate';

export type RuleType<T> = Record<keyof T, Partial<Record<ValidateName, ValidateFunction | ValidateProcess | ValidateInfo>>>;

export type FieldValidateProps<T = any> = {
  value: T;
  onChange: (value: T) => void;
  onFocus: () => void;
  onInput?: (value: T) => void;
  watch: (value: T) => void;
  dirty: boolean;
  error: boolean;
  errors: string[];
  validate: () => void;
};

export type FormValidateProps = {
  [key: string]: any;
  validate: ErrorInfo;
  handleSubmit: () => void;
  reset: () => void;
};

export default <T extends Object, R>(
  state: T,
  rules: R,
  formId: string
): FormValidateProps => {
  const validateObject: ErrorInfo = useValidate<T, R>(state, rules);

  const formControlProps: FormValidateProps = {
    validate: validateObject,
    handleSubmit: (): void => {
      if (!formControlProps .validate.dirty) {
        formControlProps.validate.dirty = true;
      }
      (validateObject.validate as Function)();
      Object.keys(state).forEach((key: string) => {
        validateObject[key].dirty = true;
        formControlProps[key] = Object.assign(
          formControlProps[key],
          validateObject[key]
        );
      });
    },
    reset: (): void => {
      Object.keys(state).forEach(
        (key: string) => {
          const keyValidateObject = validateObject[key]!;
          keyValidateObject.dirty = false;
          keyValidateObject.watch('', key);
      });
      validateObject.dirty = false;
      document.forms.namedItem(formId)?.reset();
    }
  };

  Object.keys(state).forEach((key: string) => {
    type ValueType = T[keyof T];
    formControlProps[key] = {
      value: validateObject.values[key],
      onChange: <O extends HTMLInputElement>(arg: ChangeEvent<O> | ValueType): void => {
        const elementTargetValue: ValueType =
          (arg as ChangeEvent<O>).currentTarget?.value as ValueType;
        const currentValue: ValueType =
          elementTargetValue === null || elementTargetValue === undefined
            ? (arg as ValueType)
            : elementTargetValue;
        validateObject[key].watch!(currentValue, key);
      },
      onFocus: (): void => {
        validateObject[key].dirty = true;
        validateObject.dirty = true;
      },
      ...validateObject[key],
      watch: (currentValue: ValueType): void => {
        validateObject[key].watch!(currentValue, key);
      }
    }
  });

  return formControlProps;
};
