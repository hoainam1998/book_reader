const isArray = (value, type, message) => {
  const checker = () => {
    if (Array.isArray(value)) {
      if (['array', 'object', 'boolean', 'number', 'string'].includes(type)) {
        if (type === 'array') {
          return value.every(v => Array.isArray(v));
        } else {
          return value.every(v => typeof v === type);
        }
      }
      return true;
    }
    return false;
  };

  if (!checker()) {
    return message;
  }
};

const IsArray = (type, message, options) => {
  if (options) {
    return {
      groups: options.groups,
      validator: (value) => isArray(value, type, message)
    };
  } else {
    return (value) => isArray(value, type, message);
  }
}

module.exports = IsArray;
