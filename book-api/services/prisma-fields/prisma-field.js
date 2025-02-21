const Logger = require('#services/logger.js');
const Singleton = require('#services/singleton.js');

/**
 * Class support behavior between graphql select and prisma sql select.
 * @extends Singleton
 */
class PrismaField extends Singleton {

  /**
  * Create prisma-field service class.
  */
  constructor() {
    super(PrismaField);
  }

  /**
  * Create prisma field service class.
  * @param {string} query - The graphql query select field.
  * @return {object} - The prisma select query.
  */
  parseToPrismaSelect(query) {
    // filtering fields ex(from: { userId, email } to [userId, email]).
    const fields = query.match(/\w+/gm);

    const findChild = (fieldIndex, select) => {
      const parents = Object.entries(this._fields).reduce((arr, [key, value]) => {
        if (typeof value === 'object' && Object.hasOwn(value, 'child') && value.child.includes(fieldIndex)) {
          arr.push(key);
        }
        return arr;
      }, []);

      if (parents.length > 0) {
        const indexOfCurrentField = fields.lastIndexOf(fieldIndex);
        let fieldFound = fields.findLast((f, index) => {
          return index < indexOfCurrentField && parents.includes(f);
        });

        if (fieldFound) {
          if (Object.hasOwn(this._fields, fieldFound)) {
            fieldFound = this._fields[fieldFound].as ? this._fields[fieldFound].as : fieldFound;
          }

          const selected = select[fieldFound] || {};
          selected.select = { ...(selected.select || {}), [fieldIndex]: true };
          select[fieldFound] = selected;
        }
      }
    };

    const selectSql = fields.reduce((select, current) => {
      // if the field is valid, pushing to select query field object. Otherwise logging a warn.
      findChild(current, select);
      if (!Object.hasOwn(select, current)) {
        if (typeof this._fields[current] === 'object'
          && !Array.isArray(this._fields[current])
          && this._fields[current] !== null) {
            if (!Object.hasOwn(this._fields[current], 'child')) {
              if (Object.hasOwn(this._fields[current], 'as')) {
                const alias = this._fields[current].as;
                if (!Object.hasOwn(select, alias)) {
                  delete this._fields[current].as;
                  select[alias] = this._fields[current];
                }
              } else {
                select[current] = this._fields[current];
              }
            }
        } else if (Array.isArray(this._fields[current])) {
          this._fields[current].forEach(field => select[field] = true);
        } else if (this._fields[current]) {
          select[this._fields[current]] = true;
        } else {
          Logger.warn(this.constructor.name, `${current} is invalid!`);
        }
      }
      return select;
    }, {});

    return selectSql;
  }
}

module.exports = PrismaField;
