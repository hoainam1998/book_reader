/* eslint-disable no-use-before-define */
/* eslint-disable no-unused-vars */
import { useState, DependencyList, useLayoutEffect } from 'react';
import { customError } from 'utils';

export type ErrorFieldInfo = {
  error: boolean;
  message: string;
  max?: number;
};

export type ValidateName =
  'required' | 'maxLength' | 'email' | 'matchPattern' | 'sameAs' | 'notSameWith' | 'lestThanOrEqual' | 'greaterThan';

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
  ...args: (string | number | RegExp | (<T>(state: T) => boolean))[]
) => ValidateProcess | ValidateInfo;

const constraints: Record<string, string> = {};

const BUILTIN_VALIDATOR: string[] =
  ['required', 'maxLength', 'email', 'matchPattern', 'sameAs', 'notSameWith', 'lessThanOrEqual', 'greaterThan'];

const customValidate = (validateCallback: any): ValidateProcess =>
  (currentValue: string) => validateCallback(currentValue);

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

    if (requiredIf) {
      errorObj.error = requiredIf(state) ? errorObj.error : false;
    } else if (typeof currentValue === 'string') {
      errorObj.error = !currentValue.trim();
    } else if (Array.isArray(currentValue)) {
      errorObj.error = currentValue.length === 0;
    } else if (typeof currentValue === 'number') {
      errorObj.error = !Number.isInteger(currentValue);
    }

    return errorObj;
  };

export const email: ValidateFunction =
  (...args) =>
  <T>(currentValue: any, state: T, field: string) => {
    const message: string = args[0] ? args[0] as string: '';
    // I copy this regex at https://github.com/logaretm/vee-validate/blob/main/packages/rules/src/email.ts
    const emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\\-]*\.)+[A-Z]{2,}$/i;

    return {
      error: currentValue ? !emailRegex.test(currentValue) : false,
      message: message || `${field.charAt(0).toUpperCase()}${field.substring(1)} is not valid!`,
    };
  };

export const matchPattern: ValidateFunction =
  (...args) =>
  <T>(currentValue: any, state: T, field: string) => {
    const pattern: RegExp = args[0] as RegExp;
    const message: string = args[1] ? args[1] as string : '';

    return {
      error: currentValue ? currentValue.toString().search(pattern) < 0 : false,
      message: message || `${field.charAt(0).toUpperCase()}${field.substring(1)} is not match with pattern!`,
    };
  };

export const sameAs: ValidateFunction =
  (...args) =>
  <T>(currentValue: any, state: T, field: string) => {
    const keyConstraint: keyof T = args[0] as keyof T;
    const message: string = args[1] ? args[1] as string : '';

    if (field) {
      Object.defineProperty(constraints, keyConstraint, {
        value: field,
        configurable: false,
        enumerable: false,
        writable: false,
      });
    }

    return {
      error: currentValue.toString() !== state[keyConstraint],
      message: message || `${field.charAt(0).toUpperCase()}${field.substring(1)}
        is not same with ${keyConstraint.toString()}!`,
    };
  };

export const notSameWith: ValidateFunction =
  (...args) =>
  <T>(currentValue: any, state: T, field: string) => {
    const keyConstraint: keyof T = args[0] as keyof T;
    const message: string = args[1] ? args[1] as string : '';

    if (field) {
      Object.defineProperty(constraints, keyConstraint, {
        value: field,
        configurable: false,
        enumerable: false,
        writable: false,
      });
    }

    return {
      error: currentValue.toString() === state[keyConstraint],
      message: message || `${field.charAt(0).toUpperCase()}${field.substring(1)}
        must be different with ${keyConstraint.toString()}!`,
    };
  };

export const lessThanOrEqual: ValidateFunction =
  (...args) =>
  <T>(currentValue: any, state: T, field: string) => {
    console.log(field);
    const valueCompare: number = args[0] as number;
    const message: string = args[1] ? args[1] as string : '';

    return {
      error: currentValue.toString() > valueCompare,
      message: message || `${field.charAt(0).toUpperCase()}${field.substring(1)}
        must less than or equal ${valueCompare}!`,
    };
  };

export const greaterThan: ValidateFunction =
  (...args) =>
  <T>(currentValue: any, state: T, field: string) => {
    const keyConstraint: keyof T = args[0] as keyof T;
    const message: string = args[1] ? args[1] as string : '';

    if (field) {
      Object.defineProperty(constraints, keyConstraint, {
        value: field,
        configurable: false,
        enumerable: false,
        writable: false,
      });
    }

    return {
      error: currentValue.toString() <= state[keyConstraint],
      message: message || `${field.charAt(0).toUpperCase()}${field.substring(1)}
        must greater than ${keyConstraint.toString()}!`,
    };
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
            message = args[1] as string;
          } else {
            throw customError('Second argument is not string!');
          }
        } else {
          throw customError('Length are not provide!');
        }

        // eslint-disable-next-line no-use-before-define
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
    };
};

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

const useValidate = <T, R>(state: T, rules: R, dependencyList: DependencyList = []): ErrorInfo => {
  const setError = useState<{[key: string]: boolean}>({})[1];
  const setMax = useState<{[key: string]: number | undefined}>({})[1];
  const [value, setValue] = useState<T>(state);
  const rulesEntries: [string, R][] = Object.entries(rules as ArrayLike<R>);
  objectValidate.values = value;

  useLayoutEffect(() => {
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
  }, []);

  useLayoutEffect((): void => {
    const validateFuncs: ((value: any) => void)[] = rulesEntries.map(([key, validateRule]: [string, R]) => {
      const keyValidateInfo: ValidateErrorInfo = objectValidate[key];
      const validateRulePair = Object.entries(validateRule as ArrayLike<R>)
        .reduce(
          (obj: Record<string, ValidateFunction | ValidateProcess>, [validateName, validateInfo]: [string, R]) => {
          if (validateInfo instanceof Function) {
            if (BUILTIN_VALIDATOR.includes(validateName)) {
              obj[validateName] = validateInfo as ValidateFunction | ValidateProcess;
            } else {
              obj[validateName] = customValidate(validateInfo);
            }
          } else {
            const validateInfoObject = (validateInfo as ValidateInfo);
            obj[validateName] = validateInfoObject.func;
            keyValidateInfo.max = validateInfoObject.max;
            setMax({ key: validateInfoObject.max });
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
        setError({ key: keyValidateInfo.error });
      };
      keyValidateInfo.validate = validate;
      return validate;
    });

    objectValidate.validate = validateCompact(validateFuncs);
  }, dependencyList);

  useLayoutEffect(() => {
    objectValidate.values = value;
  }, [value]);

  function watch(this: ErrorInfo, currentValue: any, key: string): void {
    this.validate(currentValue);
    setValue({ ...value, [key]: currentValue });
    state[key as keyof T] = currentValue;
    const constraintKey = constraints[key as keyof typeof constraints];
    if (constraintKey) {
      objectValidate[constraintKey].validate(value[constraintKey as keyof T]);
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
      (keyErrorInfo[validateName] as ErrorFieldInfo).max = validateResult.max;
    }

    if (Array.isArray(keyErrorInfo.errors)) {
      if (validateResult.error) {
        if (!keyErrorInfo.errors!.includes(validateResult.message)) {
          keyErrorInfo.errors.push(validateResult.message);
        }
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
