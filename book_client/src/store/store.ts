type ListenerType = (() => void)[];

class Store<T> {
  protected listeners: ListenerType = [];
  private currentStore: T;

  constructor(currentStore: T) {
    this.currentStore = currentStore;
  }

  set CurrentStore(value: T) {
    this.currentStore = value;
  }

  get CurrentStore() {
    return this.currentStore;
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
    return this.currentStore;
  };
};

export default Store;
