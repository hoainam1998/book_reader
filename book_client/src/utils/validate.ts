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


export type ValidateProcess = <T>(state: T, field: string) => ErrorFieldInfo;

export type ValidateFunction = (message?: string) => ValidateProcess;

export const required: ValidateFunction = (message: string | null = null) => <T>(state: T, field: string): ErrorFieldInfo => {
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

const validateHelper = <T, R>(state: T, rules: R & ArrayLike<unknown>): ErrorInfo => {
  const validateProcess = (field: string, validateName: string, validateResult: ErrorFieldInfo): void => {
    objectValidate[field][validateName].error = validateResult.error;
    objectValidate[field].error = validateResult.error;
    objectValidate.error = validateResult.error;
    if (validateResult.error) {
      objectValidate[field].errors.push(validateResult.message);
    } else {
      objectValidate[field].errors
        = objectValidate[field].errors.filter((message: string) => message != validateResult.message);
    }
  };

  if (!alreadyCreate) {
    Object.entries(rules).forEach(([key, validateRule]) => {
      const field: ErrorInfo = {
        validate: () => {},
        errors: [],
        dirty: false,
        error: false
      };
      Object.keys(validateRule as any).forEach(validateName => {
        field[validateName] = {
          error: false
        };
      });
      objectValidate[key] = field;
    });
    alreadyCreate = true;
  }

  const validateFuncs = Object.entries(rules).map(([key, validateRule]) => {
    const validate = (): void => {
      for (const [validateName, validateFunc] of Object.entries(validateRule as any)) {
        if (objectValidate.dirty || objectValidate[key].dirty) {
          try {
            validateProcess(key, validateName, (validateFunc as ValidateFunction)()<T>(state, key));
          } catch {
            validateProcess(key, validateName, (validateFunc as ValidateProcess)<T>(state, key));
          }
        }
      }
    };
    objectValidate[key].validate = validate;
    return validate;
  });

  objectValidate.validate = validateCompact(validateFuncs);

  return objectValidate;
};

export default validateHelper;
