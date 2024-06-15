export const required = (message: string | null = null) => (state: any, field: string) => {
  return {
    error: !state[field].trim(),
    message: message ?? `${field.charAt(0).toUpperCase()}${field.substring(1)} is required!`,
  };
};

let objectValidate: any = { errors: [], dirty: false, error: false };

const validate = (state: any, rules: any) => {
  const validateProcess = (field: string, validateName: string, validateResult: any) => {
    objectValidate[field][validateName].error = validateResult.error;
    objectValidate[field].error = validateResult.error;
    objectValidate.error = validateResult.error;
    if (validateResult.error) {
      objectValidate.errors.push(validateResult.message);
    }
  };

  for (const [key, validateRule] of Object.entries(rules)) {
    const validate = (init = false) => {
      for (const [validateName, validateFunc] of Object.entries(validateRule as any)) {
        !init && validateProcess(key, validateName, (validateFunc as any)()(state, key));
        if (init) {
          objectValidate = Object.assign(objectValidate, {
            [key]: {
              [validateName]: {
                error: false
              },
              error: false,
              validate
            },
            error: false
          })
        };
      }
    };
    validate(true);
  }

  return objectValidate;
};

export default validate;
