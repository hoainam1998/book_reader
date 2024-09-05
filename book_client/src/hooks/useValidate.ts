import { useState, useEffect } from 'react';
import { customError } from 'utils';

type ErrorFieldInfo = {
  error: boolean;
  message: string;
  max?: number;
};

export type ValidateName = 'required' |  'maxLength';

export type ValidateErrorInfo = {
  [key: string]: ErrorFieldInfo | boolean | number | Function | Array<string> | undefined;
};

export type ErrorInfo = {
  [key: string]: any;
  dirty: boolean;
  error: boolean;
  errors: string[];
  watch: (value: any, key: string) => void;
  validate: (value: any) => void;
  max?: number;
  values?: any;
};

export type ValidateProcess = <T>(currentValue: any, state: T, field: string) => ErrorFieldInfo;

export type ValidateInfo = {
  func: ValidateProcess;
  max?: number;
};

export type ValidateFunction = (
  ...args: (string | number | (<T>(state: T) => boolean))[]
) => ValidateProcess | ValidateInfo;

export const required: ValidateFunction =
  (...args) =>
  <T>(currentValue: any, state: T, field: string) => {
    let message: string = '';
    let requiredIf: (<T>(state: T) => boolean) | undefined = undefined;

    if (args.length === 1) {
      if (typeof args[0] === 'string') {
        message = args[0];
      } else {
        requiredIf = args[0] as (<T>(state: T) => boolean);
      }
    } else if (args.length === 2) {
      message = args[0] as string;
      requiredIf = args[1] as <T>(state: T) => boolean;
    }

    const errorObj: ErrorFieldInfo = {
      error: !currentValue,
      message: message || `${field.charAt(0).toUpperCase()}${field.substring(1)} is required!`
    };

    if (typeof currentValue === 'string') {
      errorObj.error = !currentValue.trim();
    } else if (Array.isArray(currentValue)) {
      errorObj.error = currentValue.length === 0;
    } else if (requiredIf) {
      errorObj.error = requiredIf(state) ? errorObj.error : false;
    }

    return errorObj;
  };

export const maxLength: ValidateFunction =
  (...args) => {
    return {
      max: typeof args[0] === 'number' ? args[0] : undefined,
      func: <T>(currentValue: any, state: T, field: string) => {
        let max: number = Math.max();
        let message: string = '';

        if (args.length === 1) {
          if (typeof args[0] === 'number') {
            max = args[0];
          } else {
            throw customError('First argument is not positive number!');
          }
        } else if (args.length === 2) {
          if (typeof args[0] === 'number') {
            max = args[0];
          } else {
            throw customError('First argument is not positive number!');
          }

          if (typeof args[1] === 'string') {
            message = args[1] as unknown as string;
          } else {
            throw customError('Second argument is not string!');
          }
        } else {
          throw customError('Length are not provide!');
        }

        objectValidate[field].max = max;

        const errorObj: ErrorFieldInfo = {
          error: false,
          message: message || `${field.charAt(0).toUpperCase()}${field.substring(1)} exceed to ${max} elements!`,
          max
        };

        if (typeof currentValue === 'string') {
          errorObj.error = currentValue.trim().length > max;
        } else if (Array.isArray(currentValue)) {
          errorObj.error = currentValue.length > max;
        }

        return errorObj;
      }
    }
}

const validateCompact = (validates: ((value?: any) => void)[]): (() => void) => {
  return () => validates.forEach((validate) => validate());
};

const objectValidate: ErrorInfo = {
  dirty: false,
  error: false,
  errors: [],
  watch: () => {},
  validate: () => {},
};

const useValidate = <T, R>(state: T, rules: R): ErrorInfo => {
  const setError = useState<boolean>(false)[1];
  const [value, setValue] = useState<T>(state);
  const rulesEntries: [string, R][] = Object.entries(rules as ArrayLike<R>);
  objectValidate.values = value;

  useEffect((): void => {
    rulesEntries.forEach(([key, validateRule]: [string, R]) => {
      const field: ValidateErrorInfo = {
        validate: () => {},
        watch,
        errors: [],
        dirty: false,
        error: false
      };
      Object.keys(validateRule as ArrayLike<R>).forEach((validateName: string) => {
        field[validateName] = {
          error: false,
          message: '',
        };
      });
      objectValidate[key] = field;
    });

    const validateFuncs: ((value: any) => void)[] = rulesEntries.map(([key, validateRule]: [string, R]) => {
      const keyValidateInfo: ValidateErrorInfo = objectValidate[key];
      const validateRulePair = Object.entries(validateRule as ArrayLike<R>)
        .reduce((obj: Record<string, ValidateFunction | ValidateProcess>, [validateName, validateInfo]: [string, R]) => {
        if (validateInfo instanceof Function) {
          obj[validateName] = validateInfo as ValidateFunction | ValidateProcess;
        } else {
          const validateInfoObject = (validateInfo as ValidateInfo);
          obj[validateName] = validateInfoObject.func;
          if (validateInfoObject.max) {
            keyValidateInfo.max = validateInfoObject.max;
          }
        }
        return obj;
      }, {});
      const validate = (value: any = state[key as keyof T]): void => {
        keyValidateInfo.error = Object.entries(validateRulePair).map(
          ([validateName, validateFunc]: [string, ValidateFunction | ValidateProcess]) => {
            let validateResult: boolean = false;
            if (objectValidate.dirty || keyValidateInfo.dirty) {
              try {
                validateResult = validateProcess(
                  key,
                  validateName as ValidateName,
                  ((validateFunc as ValidateFunction)() as ValidateProcess)<T>(value, state, key)
                );
              } catch {
                validateResult = validateProcess(
                  key,
                  validateName as ValidateName,
                  (validateFunc as ValidateProcess)<T>(value, state, key)
                );
              }
            } else {
              keyValidateInfo.errors = [];
            }
            return validateResult;
          }
        ).some(err => err === true);
        objectValidate.error = rulesEntries.some(([key]: [string, R]) => objectValidate[key].error);
        setError(objectValidate.error);
      };
      keyValidateInfo.validate = validate;
      return validate;
    });

    objectValidate.validate = validateCompact(validateFuncs);
  }, []);

  useEffect(() => {
    objectValidate.values = value;
  }, [value]);

  function watch(this: ErrorInfo, currentValue: any, key: string) {
    this.validate(currentValue);
    if (!this.error) {
      setValue({ ...value, [key]: currentValue });
      state[key as keyof T] = currentValue;
    }
  }

  const validateProcess = (
    field: string,
    validateName: ValidateName,
    validateResult: ErrorFieldInfo
  ): boolean => {
    const keyErrorInfo: ValidateErrorInfo = objectValidate[field];
    (keyErrorInfo[validateName] as ErrorFieldInfo).error = validateResult.error;

    if (validateResult.max) {
      keyErrorInfo.max = validateResult.max;
      (keyErrorInfo[validateName] as ErrorFieldInfo).max = validateResult.max;
    }

    if (Array.isArray(keyErrorInfo.errors)) {
      if (validateResult.error && !keyErrorInfo.errors!.includes(validateResult.message)) {
        keyErrorInfo.errors.push(validateResult.message);
      } else {
        keyErrorInfo.errors = keyErrorInfo.errors.filter(
          (message: string) => message != validateResult.message
        );
      }
    }

    return validateResult.error;
  };

  return objectValidate;
};

export default useValidate;
