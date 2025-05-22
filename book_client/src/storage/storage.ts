/**
 * The class support store app information and behavior attach with them.
 *
 * @class
 * @abstract
 */
abstract class Storage<T> {
  protected readonly _name;
  static allStorage: Storage<any>[] = [];

  get Name() {
    return this._name;
  }

  /**
  * Create storage instance.
  *
  * @param {string} name - The store name.
  */
  constructor(name: string) {
    this._name = name;
    Storage.allStorage.push(this);
  }

  /**
  * Saving data.
  *
  * @param {*} data - The data stored.
  * @abstract
  */
  abstract setItem(data: T): void;

  /**
  * Retire data.
  *
  * @abstract
  */
  abstract getItem(): T;

  /**
  * Delete data out of store.
  *
  * @abstract
  */
  abstract delete(): void;

  /**
  * Remove data out of all store.
  *
  * @static
  */
  static removeAll(): void {
    Storage.allStorage.forEach((storage) => storage.delete());
  }
}

export default Storage;
