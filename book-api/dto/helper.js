const { validation } = require('#services/validator.js');

/**
* Adding class name and sealing validate object.
*
* @param {class} cls - The validate class.
* @param {string} className - class name.
* @return {class} The sealed object.
*/
const classCreator = (cls, className) => {
  cls.prototype.className = className;
  return class extends cls {
    constructor() {
      super();
      Object.seal(this);
    }
  };
};

/**
* Create a validate class.
*
* @param {...*} args - The parameters.
* @return {class} The validate class.
*/
const Validation = (...args) => {
  /**
  * Create validate class.
  *
  * @param {string} className - The class name.
  * @param {Function} constructorFn - The class creator.
  * @return {class} The validate class.
  */
  const initClass = (className, constructorFn) => {
    const validators = validation(className);
    return constructorFn(validators, className);
  };

  // if first param type is string, then it is the class name.
  // else not I will using name of class creator function instead for
  if (typeof args[0] === 'string') {
    const className = args[0];
    const constructorFn = args[1];
    return initClass(className, constructorFn);
  } else {
    const constructorFn = args[0];
    const className = constructorFn.name;
    return initClass(className, constructorFn);
  }
};

module.exports = {
  classCreator,
  Validation
};
