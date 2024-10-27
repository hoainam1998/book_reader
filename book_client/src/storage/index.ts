export type Image = {
  image: string;
  name: string;
};

export type BookInfoType = {
  bookId: string;
  name: string;
  pdf: string;
  publishedTime: number;
  publishedDay: string;
  categoryId: string;
  images: Image[];
  avatar: string;
  introduce?: {
    html: string;
    json: string;
  };
};

export type UserLogin = {
  name: string;
  email: string;
  avatar: string;
  mfaEnable: boolean;
  password: string;
};

export class LocalStorage<T> {
  private readonly _name: string;
  static allLocalStorage: any[] = [];

  constructor(name: string) {
    this._name = name;
    LocalStorage.allLocalStorage.push(this);
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

  static removeAll(): void {
    LocalStorage.allLocalStorage.forEach(localStorage => localStorage.delete());
  }
}

export const StepStorage = new LocalStorage<number>('step');
export const DisableStepStorage = new LocalStorage<number | false>('disable-step');
export const BookInfoStorage = new LocalStorage<BookInfoType>('book-info');
export const UserStorage = new LocalStorage<UserLogin>('user');
export const ApiKeyStorage = new LocalStorage<string>('api-key');
