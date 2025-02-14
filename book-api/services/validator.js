const Singleton = require('./singleton.js');

/**
* Class support validation request body object.
* @extends Singleton
*/
class Validator extends Singleton {
  constructor() {
    super(Validator);
  }

  /**
  * Validate request body based on validate class.
  * @return {(object | void)} - The validate result object if validators provided.
  */
  validate(validateGroups) {
    const validating = (validateFn, value, results, errors) => {
      const result = validateFn(value);
      if (result) {
        results.errors.push(result);
        errors.push(result);
      };
    };

    if (this.validators) {
      const name = this.className;
      return Object.keys(this.validators[name]).reduce((results, key) => {
        results[key] = {
          errors: this.validators[name][key].reduce((errors, validator) => {
            if (typeof validator === 'object' && validateGroups && validateGroups.length) {
              const groups = validator.groups;
              const validateFn = validator.validator;
              const groupNames =  [...validateGroups, ...groups];
              const isDuplicate = groupNames.filter(
                (groupName, index, array) => array.indexOf(groupName) !== index && array.lastIndexOf(groupName) === index).length;
              if (isDuplicate) {
                validating(validateFn, this[key], results, errors);
              }
            } else if (typeof validator === 'function') {
              validating(validator, this[key], results, errors);
            }
            return errors;
          }, []),
        };
        return results;
      }, { errors: [] });
    }
  }
}

const validation = (cls) => {
  return (...validatorsFn) => {
    validatorsFn = validatorsFn.some(validateInfo => typeof validateInfo === 'object' && validateInfo.isOptional) ? [] : validatorsFn;
    if (validatorsFn.some(validateInfo => typeof validateInfo === 'object' && validateInfo.isOptional)) {
      validatorsFn = [];
    } else {
      validatorsFn = validatorsFn.filter(validateInfo => !(typeof validateInfo === 'object' && Object.hasOwn(validateInfo, 'isOptional')));
    }
    return (target) => {
      Validator.prototype.validators = {
        ...Validator.prototype.validators,
        [cls]: {
          ...(cls && !!Validator.prototype.validators ? Validator.prototype.validators[cls] : {}),
          [target.key]: validatorsFn,
        }
      };
    };
  };
}

module.exports = {
  Validator,
  validation,
};
