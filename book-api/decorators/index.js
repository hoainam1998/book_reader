const { validate, parse } = require('graphql');
const upload = require('./upload.js');
const uploadPdf = require('./upload-pdf-file.js');
const { HTTP_CODE, INTERNAL_ERROR_MESSAGE, REQUEST_DATA_PASSED_TYPE } = require('#constants');
const { messageCreator, getGeneratorFunctionData, graphqlQueryParser } = require('#utils');
const { plainToInstance } = require('class-transformer');
const Logger = require('#services/logger.js');

/**
 * Return validate execute query decorator.
 *
 * @param {Object} - information of graphql execute function.
 * @returns {Object} - new decorator object.
 */
const validateExecuteQuery =
  (target) => {
    const originalMethod = target.descriptor.value;
    target.descriptor.value = function* (...args) {
      const query = args[0];
      const schema = this._schema;
      args[2] = args[2] ? this.PrismaField.parseToPrismaSelect(args[2]) : args[2];
      try {
        const queryAst = parse(query);
        // validate graphql query
        const errors = validate(schema, queryAst);
        // if get errors, log those errors, then return internal server error.
        if (errors.length > 0) {
          errors.forEach(err => Logger.error(this.constructor.name, err.message));
          return {
            json: messageCreator(INTERNAL_ERROR_MESSAGE),
            status: HTTP_CODE.SERVER_ERROR
          };
        }
        args[0] = queryAst;
        // if call origin method error, log error, return internal server error.
        try {
          return yield originalMethod.apply(this, args);
        } catch (error) {;
          Logger.error(this.constructor.name, error.message);
          return {
            json: messageCreator(INTERNAL_ERROR_MESSAGE),
            status: HTTP_CODE.SERVER_ERROR
          };
        }
      } catch (error) {
        // any other error, log error, return internal server error.
        Logger.error(this.constructor.name, error.message);
        return {
          json: messageCreator(error.message),
          status: HTTP_CODE.SERVER_ERROR
        };
      }
    }
    return target;
  };

/**
 * Return function validate result query execute decorator.
 *
 * @param {number} - http code.
 * @returns {function} - decorator function.
 */
const validateResultExecute = (httpCode) => {
  return (target) => {
    const originalMethod = target.descriptor.value;
    target.descriptor.value = function (...args) {
      const response = args[1];
      const self = args[args.length - 1];
      try {
        const finalResult = getGeneratorFunctionData(originalMethod.apply(null, args));
        if (finalResult instanceof Promise) {
          finalResult.then(result => {
            const resultClone = JSON.parse(JSON.stringify(result));
            try {
              if (resultClone.errors) {
                const error = resultClone.errors[0];
                // check error is graphql error
                if (error.extensions) {
                  const status = error.extensions?.http.status || HTTP_CODE.BAD_REQUEST;
                  if (error.extensions?.response) {
                    return response.status(status).json(error.extensions.response);
                  }
                  self.Logger.error(error.message);
                  response.status(status).json(messageCreator(error.message));
                } else {
                  self.Logger.error(error.message);
                  response.status(HTTP_CODE.SERVER_ERROR).json(messageCreator(INTERNAL_ERROR_MESSAGE));
                }
              } else {
                return response.status(httpCode).json(resultClone);
              }
            } catch (err) {
              Logger.error('Validate graphql execute result', err.message);
              response.status(HTTP_CODE.SERVER_ERROR).json(messageCreator(INTERNAL_ERROR_MESSAGE));
            }
          })
          .catch(err => {
            if ([HTTP_CODE.BAD_REQUEST, HTTP_CODE.UNAUTHORIZED, HTTP_CODE.NOT_FOUND].includes(err.status)) {
              const sts = err.status;
              delete err.status;
              return response.status(sts).json(err);
            }
            Logger.error('Validate graphql execute result', err.message);
            response.status(HTTP_CODE.SERVER_ERROR).json(messageCreator(INTERNAL_ERROR_MESSAGE));
          });
        } else if (finalResult?.errors) {
          finalResult.errors.forEach(error => self.Logger.error(error.message));
          response.status(HTTP_CODE.SERVER_ERROR).json(messageCreator(INTERNAL_ERROR_MESSAGE));
        } else if (finalResult?.data) {
          response.status(httpCode).json(finalResult.data);
        } else if (finalResult && Object.hasOwn(finalResult, 'status') && Object.hasOwn(finalResult, 'json')){
          response.status(finalResult.status).json(finalResult.json);
        } else if (finalResult) {
          response.status(httpCode).json(finalResult);
        } else {
          response.status(HTTP_CODE.SERVER_ERROR).json(messageCreator(INTERNAL_ERROR_MESSAGE));
        }
      } catch (error) {
        self.Logger.error(error.message);
        response.status(HTTP_CODE.SERVER_ERROR).json(messageCreator(INTERNAL_ERROR_MESSAGE));
      }
    };
    return target;
  };
};

/**
 * Convert parameter of middleware function.
 *
 * @param {Object} - information of middleware function.
 * @returns {Object} - new decorator object.
 */
const endpoint = (target) => {
  const originMethod = target.descriptor.value;
  target.descriptor.value = function (...args) {
    // get current middleware
    let caller = args.pop();
    // re-assign with new parameter "this"(current object using this middleware).
    const handler = (req, res, next) => caller(req, res, next, this);
    originMethod.apply(this, [...args, handler]);
  };
  return target;
};

/**
 * Inject graphql execute service to current router object.
 *
 * @param {class} target - router class.
 * @returns {class} - new class extend from target object.
 */
const graphqlExecuteWrapper = (target) => {
  return class extends target {
    _graphqlExecute;

    /**
    * Create new graphql execute service class.
    * @param {...*} args - The new graphql execute object.
    */
    constructor(...args) {
      super(...args);
      this._graphqlExecute = args.pop();
    }

    /**
    * Execute graphql query.
    * @param {...*} args - The arguments provided for execute function.
    */
    execute(...args) {
      return this._graphqlExecute.execute.apply(this._graphqlExecute, args);
    };
  };
};

/**
 * Inject logger service to current router object.
 *
 * @param {class} target - router class.
 * @returns {class} - new class extend from target object.
 */
const loggerWrapper = (target) => {
  return class extends target {
    _logger;

    /**
    * Create new logger service class.
    * @param {...*} args - The new logger object.
    */
    constructor(...args) {
      super(...args);
      this._logger = new Logger(target.name);
    }

    /**
    * Getter, return logger instance.
    */
    get Logger() {
      return this._logger;
    }
  };
};

/**
 * Serializing response according pattern class.
 *
 * @param {class} serializerClass - serializer class.
 * @returns {Object} - new target object.
 */
const serializer = (serializerClass) => {
  return (target) => {
    const originMethod = target.descriptor.value;
    target.descriptor.value = function (...args) {
      const finalResult = getGeneratorFunctionData(originMethod.apply(this, args));
      if (!(finalResult instanceof Error)) {
        if (finalResult instanceof Promise) {
          return finalResult.then(value => {
            // convert value into the instance serializerClass, if response not include in instance,
            // then value is deserialization value, and they will directly throw.
            const { response } = plainToInstance(serializerClass, value);
            return response ?? value;
          });
        }
        return finalResult;
      }
      return finalResult;
    };
    return target;
  };
};

/**
 * Validation incoming request data.
 *
 * @param {...*} args - The parameters.
 * @returns {Function} - decorator function.
 */
const validation = (...args) => {
  const validateInfo = args[0];
  const options = args[1];
  const { PARAM, QUERY, FILES } = REQUEST_DATA_PASSED_TYPE;

  return (target) => {
    const originMethod = target.descriptor.value;
    target.descriptor.value = function (...args) {
      const request = args[0];
      const response = args[1];

      try {
        // it is flag will be determinate, origin method will run or not.
        let lastRun = true;
        const { groups, request_data_passed_type, error_message } = options || {};
        let errorMessage = 'Something is not expected. Please try again or contact my admin!';
        // error_message was provided, append it into default error message.
        if (error_message) {
          errorMessage = `${error_message} \n${errorMessage}`;
        }

        /**
         * Validate helper.
         *
         * @param {string} type - Request data type (ex: files, params, body...)
         * @param {class} validateClass - validate class
         */
        const validating = (type, validateClass) => {
          if (request[type] && Object.keys(request[type]).length) {
            // convert request incoming data to instance validate class.
            // all validate class extended by Validator, therefor it owned validated method
            // run validate method with parameter, return errors array
            const errorsValidated = plainToInstance(validateClass, request[type]).validate(groups)?.errors;
            // error is empty, skip
            if (errorsValidated.length) {
              // update lastRun flag, and return bad request response.
              if (lastRun) {
                lastRun = false;
              }
              return response.status(HTTP_CODE.BAD_REQUEST).json({
                errors: errorsValidated,
                message: errorMessage
              });
            }
          }
        };

        /**
         * Validate by request data type passed.
         *
         * @param {class} validateClass - The validate class.
         * @param {string} requestDataPassedType - Request data type (ex: files, params, body...)
         */
        const handleByType = (validateClass, requestDataPassedType) => {
          switch (requestDataPassedType) {
            case PARAM:
              validating('params', validateClass);
              break;
            case QUERY:
              validating('query', validateClass);
              break;
            case FILES:
              validating('files', validateClass);
              break;
            default:
              validating('body', validateClass);
              break;
          }
        };

        // validateInfo will be array to validate multiple request data passed type, or will be object
        // In case validateInfo is object, default request data passed type will be 'body'
        if (Array.isArray(validateInfo)) {
          validateInfo.forEach(({ validate_class, request_data_passed_type }) => {
            handleByType(validate_class, request_data_passed_type);
          });
        } else {
          handleByType(validateInfo, request_data_passed_type);
        }

        if (request.body && request.body.query) {
          // parsing
          request.body.query = graphqlQueryParser(request.body.query);
        }

        lastRun && originMethod.apply(this, args);
      } catch (error) {
        // if any error, return server error.
        Logger.error('Validation', error.message);
        return response.status(HTTP_CODE.SERVER_ERROR).json(messageCreator(INTERNAL_ERROR_MESSAGE));
      }
    };
    return target;
  };
};

module.exports = {
  validateResultExecute,
  validateExecuteQuery,
  upload,
  uploadPdf,
  endpoint,
  graphqlExecuteWrapper,
  loggerWrapper,
  serializer,
  validation,
};
