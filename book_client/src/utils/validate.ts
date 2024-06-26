type ErrorFieldInfo = {
  error: boolean;
  message: string;
};

type ErrorInfo = {
  dirty: boolean;
  error: boolean;
  validate: () => void;
  [key: string]: any;
};

// eslint-disable-next-line no-unused-vars
export type ValidateProcess = <T>(state: T, field: string) => ErrorFieldInfo;

// eslint-disable-next-line no-unused-vars
export type ValidateFunction = (message?: string) => ValidateProcess;

export const required: ValidateFunction =
  (message: string | null = null) => <T>(state: T, field: string): ErrorFieldInfo => {
    return {
      error: !(state[field as keyof T] as string).trim(),
      message: message ?? `${field.charAt(0).toUpperCase()}${field.substring(1)} is required!`,
    };
};

const validateCompact = (validates: (() => void)[]): () => void => {
  return () => validates.forEach(validate => validate());
};

let objectValidate: ErrorInfo = {
  dirty: false,
  error: false,
  validate: () => {}
};

let alreadyCreate = false;

const validateHelper =
  <T, R>(state: T, rules: R & ArrayLike<R>): ErrorInfo => {
  const validateProcess = (field: string, validateName: string, validateResult: ErrorFieldInfo): boolean => {
    objectValidate[field][validateName].error = validateResult.error;
    if (validateResult.error) {
      objectValidate[field].errors.push(validateResult.message);
    } else {
      objectValidate[field].errors
        = objectValidate[field].errors.filter((message: string) => message != validateResult.message);
    }
    return validateResult.error;
  };

  if (!alreadyCreate) {
    Object.entries(rules).forEach(([key, validateRule]: [string, R]) => {
      const field: ErrorInfo = {
        validate: () => {},
        errors: [],
        dirty: false,
        error: false
      };
      Object.keys(validateRule as ArrayLike<R>).forEach(validateName => {
        field[validateName] = {
          error: false
        };
      });
      objectValidate[key] = field;
    });
    alreadyCreate = true;
  }

  const validateFuncs = Object.entries(rules).map(([key, validateRule]: [string, R]) => {
    const validate = (): void => {
      objectValidate[key].error = Object.entries(validateRule as ArrayLike<R>)
        .every(([validateName, validateFunc]:[string, R]) => {
          let validateResult: boolean = false;
          if (objectValidate.dirty || objectValidate[key].dirty) {
            try {
              validateResult =
              validateProcess(key, validateName, (validateFunc as ValidateFunction)()<T>(state, key));
            } catch {
              validateResult = validateProcess(key, validateName, (validateFunc as ValidateProcess)<T>(state, key));
            }
          }
          return validateResult;
      });
      objectValidate.error = Object.keys(rules).some(key => objectValidate[key].error);
    };
    objectValidate[key].validate = validate;
    return validate;
  });

  objectValidate.validate = validateCompact(validateFuncs);
  return objectValidate;
};

export default validateHelper;
