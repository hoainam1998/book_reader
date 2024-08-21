class LocalStorage<T> {
  private readonly _name: string;

  constructor(name: string) {
    this._name = name;
  }

  setItem(data: T): void {
    localStorage.setItem(this._name, JSON.stringify(data));
  }

  getItem(): T {
    return JSON.parse(localStorage.getItem(this._name)!);
  }

  delete(): void {
    localStorage.removeItem(this._name);
  }
}

export const StepStorage = new LocalStorage<number>('step');
