import Storage from './storage';

/**
 * The class support store app information in localStorage and behavior attach with them.
 *
 * @class
 * @extends Storage
 */
class LocalStorage<T> extends Storage<T> {

  constructor(name: string) {
    super(name);
  }

  setItem(data: T): void {
    localStorage.setItem(this.Name, JSON.stringify(data));
  }

  getItem(): T {
    return JSON.parse(localStorage.getItem(this.Name)!);
  }

  delete(): void {
    localStorage.removeItem(this.Name);
  }
}

export default LocalStorage;
