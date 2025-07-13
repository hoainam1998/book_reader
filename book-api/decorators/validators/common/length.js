const checkLength = (value, limit, message) => {
  if (typeof value === 'string' || Array.isArray(value)) {
    if (value.length != limit) {
      return message;
    }
  } else {
    return message;
  }
};

const Length = (limit, message, options) => {
  if (options) {
    return {
      groups: options.groups,
      validator: (value) => checkLength(value, limit, message),
    };
  } else {
    return (value) => checkLength(value, limit, message);
  }
};

module.exports = Length;
