/* eslint-disable no-unused-vars */
import { ChangeEvent, DependencyList } from 'react';
import useValidate, {
  ValidateFunction,
  ValidateProcess,
  ErrorInfo,
  ValidateInfo,
  ValidateName
} from './useValidate';

export type RuleType<T> =
  Record<keyof T, Partial<Record<ValidateName | string, ValidateFunction | ValidateProcess | ValidateInfo>>>;

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

const validateValue = (event: ChangeEvent): any => {
  const elementTargetValue: any =
  (event.currentTarget as HTMLInputElement)?.value;

  if (elementTargetValue === null || elementTargetValue === undefined) {
    return event;
  } else {
    if (!elementTargetValue
      && (event.currentTarget as HTMLInputElement)?.files
      && (event.currentTarget as HTMLInputElement)?.files!.length > 0) {
        const fileList = Array.from((event.currentTarget as HTMLInputElement)?.files || []);
        return fileList[0].name;
    } else {
      return elementTargetValue;
    }
  }
};

export default <T extends Object, R>(
  state: T,
  rules: R,
  formId: string,
  dependencyList?: DependencyList
): FormValidateProps => {
  const validateObject: ErrorInfo = useValidate<T, R>(state, rules, dependencyList);

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
      validateObject.dirty = false;
      Object.keys(state).forEach(
        (key: string) => {
          const keyValidateObject = validateObject[key]!;
          keyValidateObject.watch('', key);
          keyValidateObject.dirty = false;
      });
      document.forms.namedItem(formId)?.reset();
    }
  };

  Object.keys(state).forEach((key: string) => {
    type ValueType = T[keyof T];
    formControlProps[key] = {
      value: validateObject.values[key],
      onChange: <O extends HTMLInputElement>(arg: ChangeEvent<O> | ValueType): void => {
        const currentValue = validateValue(arg as any);
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
    };
  });

  return formControlProps;
};
