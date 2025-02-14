const Singleton = require('./singleton.js');

/**
* Class support validation request body object.
* @extends Singleton
*/
class Validator extends Singleton {

  /**
  * Create validator instance.
  */
  constructor() {
    super(Validator);
  }

  /**
  * Validate request body based on validate class.
  *
  * @return {(object | void)} - The validate result object if validators provided.
  */
  validate(validateGroups) {
    /**
    * Validate field, if have error, push them to error array,
    *
    * @param {Function} validateFn - The validator function.
    * @param {*} value - The current value.
    * @param {object} results - The validate result.
    * @param {Array} errors - The error array.
    */
    const validating = (validateFn, value, results, errors) => {
      const result = validateFn(value);
      if (result) {
        results.errors.push(result);
        errors.push(result);
      };
    };

    if (this.validators) {
      const name = this.className;
      // loop through all the key validate in validate instance.
      return Object.keys(this.validators[name]).reduce((results, key) => {
        // adding validate result by key in result object.
        results[key] = {
          // loop through all validator
          errors: this.validators[name][key].reduce((errors, validator) => {
            // if validator is object
            if (typeof validator === 'object' && validateGroups && validateGroups.length) {
              // separate validator to groups and validator function.
              // groups it mean context validate, we can validate the fields according this groups.
              const groups = validator.groups;
              const validateFn = validator.validator;
              // merged validate groups of validate method parameter and validator groups
              const groupNames =  [...validateGroups, ...groups];
              // if group name is duplicate, proved we will validate keys according this group.
              const isDuplicate = groupNames.filter(
                (groupName, index, array) => array.indexOf(groupName) !== index && array.lastIndexOf(groupName) === index).length;
              if (isDuplicate) {
                validating(validateFn, this[key], results, errors);
              }
            } else if (typeof validator === 'function') {
              // if validator is not object, it is validator function.
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

/**
* Adding validators according to validate object.
*
* @param {string} cls - The class name.
* @return {Function} - The decorator function.
*/
const validation = (cls) => {
  return (...validatorsFn) => {
    // if using IsOptional for this key, then all validator function will be ignore.
    if (validatorsFn.some(validateInfo => typeof validateInfo === 'object' && validateInfo.isOptional)) {
      validatorsFn = [];
    } else {
      // else those validator function will run, except IsOptional
      validatorsFn = validatorsFn.filter(validateInfo => !(typeof validateInfo === 'object' && Object.hasOwn(validateInfo, 'isOptional')));
    }
    // adding validator object into validator instance.
    // all validator function in this object will be run validate method.
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
