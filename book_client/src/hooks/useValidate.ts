import { useState, useEffect } from 'react';

type ErrorFieldInfo = {
  error: boolean;
  message: string;
};

export type ValidateName = 'required';

export type UnionTypeErrorInfo = {
  dirty: boolean;
  error: boolean;
  errors: string[];
  validate: () => void;
};

export type ErrorInfo = {
  [key: string]: unknown;
} & UnionTypeErrorInfo;

export type ValidateProcess = <T>(state: T, field: string) => ErrorFieldInfo;

export type ValidateFunction = (
  ...args: (string | (<T>(state: T) => boolean))[]
) => ValidateProcess;

export const required: ValidateFunction =
  (...args) =>
  <T>(state: T, field: string) => {
    const value: unknown = state[field as keyof T];
    let message: string = '';
    let requiredIf: (<T>(state: T) => boolean) | undefined = undefined;

    if (args.length === 1) {
      if (typeof args[0] === 'string') {
        message = args[0];
      } else {
        requiredIf = args[0];
      }
    } else if (args.length === 2) {
      message = args[0] as string;
      requiredIf = args[1] as <T>(state: T) => boolean;
    }

    const errorObj: ErrorFieldInfo = {
      error: !value,
      message: message || `${field.charAt(0).toUpperCase()}${field.substring(1)} is required!`
    };

    if (typeof value === 'string') {
      errorObj.error = !value.trim();
    } else if (Array.isArray(value)) {
      errorObj.error = value.length === 0;
    } else if (requiredIf) {
      errorObj.error = requiredIf(state) ? errorObj.error : false;
    }

    return errorObj;
  };

const validateCompact = (validates: (() => void)[]): (() => void) => {
  return () => validates.forEach((validate) => validate());
};

const objectValidate: ErrorInfo = {
  dirty: false,
  error: false,
  errors: [],
  validate: () => {}
};

const useValidate = <T, R>(state: T, rules: R): ErrorInfo => {
  const setError = useState<boolean>(false)[1];
  const rulesEntries: [string, R][] = Object.entries(rules as ArrayLike<R>);

  useEffect((): void => {
    rulesEntries.forEach(([key, validateRule]: [string, R]) => {
      const field: ErrorInfo = {
        validate: () => {},
        errors: [],
        dirty: false,
        error: false
      };
      Object.keys(validateRule as ArrayLike<R>).forEach((validateName: string) => {
        field[validateName] = {
          error: false
        };
      });
      objectValidate[key] = field;
    });

    const validateFuncs: (() => void)[] = rulesEntries.map(([key, validateRule]: [string, R]) => {
      const keyValidateInfo: UnionTypeErrorInfo = objectValidate[key] as UnionTypeErrorInfo;
      const validate = (): void => {
        keyValidateInfo.error = Object.entries(validateRule as ArrayLike<R>).every(
          ([validateName, validateFunc]: [string, R]) => {
            let validateResult: boolean = false;
            if (objectValidate.dirty || keyValidateInfo.dirty) {
              try {
                validateResult = validateProcess(
                  key,
                  validateName as ValidateName,
                  (validateFunc as ValidateFunction)()<T>(state, key)
                );
              } catch {
                validateResult = validateProcess(
                  key,
                  validateName as ValidateName,
                  (validateFunc as ValidateProcess)<T>(state, key)
                );
              }
            } else {
              keyValidateInfo.errors = [];
            }
            return validateResult;
          }
        );
        objectValidate.error = rulesEntries.some(
          ([key]: [string, R]) => (objectValidate[key] as UnionTypeErrorInfo).error
        );
        setError(objectValidate.error);
      };
      keyValidateInfo.validate = validate;
      return validate;
    });

    objectValidate.validate = validateCompact(validateFuncs);
  }, []);

  const validateProcess = (
    field: string,
    validateName: ValidateName,
    validateResult: ErrorFieldInfo
  ): boolean => {
    const keyErrorInfo: ErrorInfo = objectValidate[field] as ErrorInfo;
    (keyErrorInfo[validateName] as ErrorFieldInfo).error = validateResult.error;

    if (validateResult.error && !keyErrorInfo.errors.includes(validateResult.message)) {
      keyErrorInfo.errors.push(validateResult.message);
    } else {
      keyErrorInfo.errors = keyErrorInfo.errors.filter(
        (message: string) => message != validateResult.message
      );
    }

    return validateResult.error;
  };

  return objectValidate;
};

export default useValidate;
