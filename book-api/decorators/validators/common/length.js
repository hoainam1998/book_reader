const checkLength = (value, limit, message) => {
  if (value.length != limit) {
    return message;
  }
};

const Length = (limit, message, options) => {
  if (options) {
    return {
      groups: options.groups,
      validator: (value) => checkLength(value, limit, message)
    };
  } else {
    return (value) => checkLength(value, limit, message);
  }
};

module.exports = Length;
