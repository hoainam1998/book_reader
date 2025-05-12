type ListenerType = (() => void)[];

class Store<T> {
  protected listeners: ListenerType = [];
  private _currentStore: T;

  constructor(currentStore: T) {
    this._currentStore = currentStore;
  }

  set CurrentStore(value: T) {
    this._currentStore = value;
  }

  get CurrentStore() {
    return this._currentStore;
  }

  protected isContainData(field: string): boolean {
    return !!this.CurrentStore && Object.hasOwn(this.CurrentStore!, field);
  }

  protected emitChange(): void {
    for (let listener of this.listeners) {
      listener();
    }
  };

  subscribe = (callback: () => void): () => void => {
    this.listeners = [...this.listeners, callback];
    return () => {};
  };

  getSnapshot = (): T =>  {
    return this._currentStore;
  };
};

export default Store;
