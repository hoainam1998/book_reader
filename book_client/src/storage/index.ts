import LocalStorage from './local-storage';
import SessionStorage from './session-storage';
import Storage from './storage';

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
  authors: string[];
};

export type UserLogin = {
  userId: string;
  clientId?: string;
  firstName?: string;
  lastName?: string;
  name: string;
  email: string;
  avatar: string;
  mfaEnable: boolean;
  password: string;
  phone: string;
  sex: number;
  role: string;
  mfaValidated: boolean;
  isLogged: boolean;
  passwordMustChange: boolean;
  resetPasswordToken: string | null;
};

export const StepStorage = new SessionStorage<number>('step');
export const DisableStepStorage = new SessionStorage<number | false>('disable-step');
export const BookInfoStorage = new SessionStorage<BookInfoType>('book-info');
export const UserStorage = new LocalStorage<UserLogin>('user');
export const ApiKeyStorage = new LocalStorage<string>('api-key');
export { Storage };
