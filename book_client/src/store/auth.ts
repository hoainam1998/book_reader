import Store from './store';
import { UserLogin, ApiKeyStorage, UserStorage } from 'storage';

const user: UserLogin = UserStorage.getItem();

class AuthStore extends Store<UserLogin | null> {
  private isLogged: boolean = !!user;

  constructor() {
    super(UserStorage.getItem());
  }

  get IsLogged() {
    return this.isLogged;
  }

  get ApiKey() {
    return ApiKeyStorage.getItem();
  }

  saveApiKey(apiKey: string): void {
    ApiKeyStorage.setItem(apiKey);
  }

  saveUserLogin(user: UserLogin): void {
    UserStorage.setItem(user);
    this.CurrentStore = user;
    this.isLogged = true;
    this.emitChange();
  }

  logout(): void {
    UserStorage.delete();
    this.CurrentStore = null;
    this.isLogged = false;
    this.emitChange();
  }
}

export type {
  UserLogin
};

export default new AuthStore();
