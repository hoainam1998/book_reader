import { ChangeEvent, useState } from 'react';
import useValidate, {
  ValidateFunction,
  ValidateProcess,
  ErrorInfo,
  UnionTypeErrorInfo,
  ValidateName
} from './useValidate';

export type RuleType<T> = {
  [key in keyof T]: Record<ValidateName, ValidateFunction | ValidateProcess>;
};

export type RuleTypeCompact<T> = RuleType<T>;

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

type UnionTypeFormValidate = {
  [key: string]: FieldValidateProps;
};

export type FormValidateProps = {
  validate: ErrorInfo;
  handleSubmit: () => void;
  reset: () => void;
};

export default <T extends Object, R>(
  state: T,
  rules: R,
  formId: string
): FormValidateProps & UnionTypeFormValidate => {
  const validateObject: ErrorInfo = useValidate<T, R>(state, rules);
  const [value, setValue] = useState<typeof state>(state);

  const formControlProps: unknown = {
    validate: validateObject,
    handleSubmit: (): void => {
      if (!(formControlProps as FormValidateProps).validate.dirty) {
        (formControlProps as FormValidateProps).validate.dirty = true;
      }
      (formControlProps as FormValidateProps).validate.validate();
      Object.keys(state).forEach((key: string) => {
        (formControlProps as ErrorInfo)[key] = Object.assign(
          (formControlProps as UnionTypeFormValidate)[key],
          validateObject[key]
        );
      });
    },
    reset: (): void => {
      Object.keys(state).forEach(
        (key: string) => ((validateObject[key] as UnionTypeErrorInfo).dirty = false)
      );
      validateObject.dirty = false;
      validateObject.validate();
      document.forms.namedItem(formId)?.reset();
    }
  };

  Object.keys(state).forEach((key: string) => {
    type ValueType = T[keyof T];
    (formControlProps as UnionTypeFormValidate)[key] = {
      value: value[key as keyof T],
      onChange: <O extends HTMLInputElement>(arg: ChangeEvent<O> | ValueType): void => {
        const elementTargetValue: ValueType = (arg as ChangeEvent<O>).currentTarget
          ?.value as ValueType;
        const currentValue: ValueType =
          elementTargetValue === null || elementTargetValue === undefined
            ? (arg as ValueType)
            : elementTargetValue;
        setValue({ ...value, [key]: currentValue });
        state[key as keyof T] = currentValue;
        (validateObject[key] as UnionTypeErrorInfo).validate();
      },
      onFocus: (): void => {
        (validateObject[key] as UnionTypeErrorInfo).dirty = true;
      },
      ...(validateObject[key] as UnionTypeErrorInfo),
      watch: (currentValue: ValueType): void => {
        (formControlProps as UnionTypeFormValidate)[key].value = currentValue;
        setValue({ ...value, [key]: currentValue });
        state[key as keyof T] = currentValue;
        validateObject.validate();
      }
    } as FieldValidateProps<ValueType>;
  });

  return formControlProps as FormValidateProps & UnionTypeFormValidate;
};
