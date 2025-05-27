const isGreaterThan = (value, context, message, valueCompare) => {
  if (!Number.isNaN(value)) {
    if (typeof valueCompare === 'string' && !Number.isNaN(context[valueCompare])) {
      if (+value <= +context[valueCompare]) {
        return message;
      }
    } else {
      return message;
    }
  } else {
    return message;
  }
};

const IsGreaterThan = (message, options) => {
  if (options) {
    return {
      groups: options.groups || [],
      validator: (value, context) => isGreaterThan(value, context, message, options.valueCompare),
      relation: true,
    };
  } else {
    return (value, context) => isGreaterThan(value, context, message, options.valueCompare);
  }
};

module.exports = IsGreaterThan;
