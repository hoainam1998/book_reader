import Storage from './storage';

/**
 * The class support store app information in sessionStorage and behavior attach with them.
 *
 * @class
 * @extends Storage
 */
class SessionStorage<T> extends Storage<T> {
  constructor(name: string) {
    super(name);
  }

  setItem(data: T): void {
    sessionStorage.setItem(this.Name, JSON.stringify(data));
  }

  getItem(): T {
    return JSON.parse(sessionStorage.getItem(this.Name)!);
  }

  delete(): void {
    sessionStorage.removeItem(this.Name);
  }
}

export default SessionStorage;
