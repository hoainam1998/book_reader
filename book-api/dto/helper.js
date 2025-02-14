const { validation } = require('#services/validator.js');

const classCreator = (cls, className) => {
  cls.prototype.className = className;
  return class extends cls {
    constructor() {
      super();
      Object.seal(this);
    }
  };
};

const Validation = (...args) => {
  const initClass = (className, constructorFn) => {
    const validators = validation(className);
    return constructorFn(validators, className);
  }

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
