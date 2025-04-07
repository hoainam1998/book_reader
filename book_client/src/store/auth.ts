import Store from './store';
import { UserLogin, ApiKeyStorage, UserStorage, LocalStorage } from 'storage';

class AuthStore extends Store<UserLogin | null> {

  constructor() {
    super(UserStorage.getItem());
  }

  set IsLogged(value: boolean) {
    if (this.CurrentStore) {
      this.CurrentStore!.isLogged = value;
      UserStorage.setItem(this.CurrentStore!);
    }
  }

  get IsLogged() {
    if (this.isContainData('isLogged')) {
      return this.CurrentStore!.isLogged;
    }
    return false;
  }

  set MfaValidated(value: boolean) {
    if (this.CurrentStore) {
      this.CurrentStore!.mfaValidated = value;
      UserStorage.setItem(this.CurrentStore!);
    }
  }

  get MfaValidated() {
    if (this.isContainData('mfaValidated')) {
      return this.CurrentStore!.mfaValidated;
    }
    return false;
  }

  get MfaEnable() {
    if (this.isContainData('mfaEnable')) {
      return this.CurrentStore?.mfaEnable;
    }
    return false;
  }

  get PasswordMustChange() {
    if (this.isContainData('passwordMustChange')) {
      return this.CurrentStore?.passwordMustChange;
    }
    return false;
  }

  get ResetPasswordToken() {
    if (this.isContainData('resetPasswordToken')) {
      return this.CurrentStore?.resetPasswordToken;
    }
    return null;
  }

  get ApiKey() {
    return ApiKeyStorage.getItem();
  }

  destroyResetPasswordToken() {
    if (this.isContainData('resetPasswordToken')) {
      this.CurrentStore!.resetPasswordToken = null;
      UserStorage.setItem(this.CurrentStore!);
    }
  }

  saveApiKey(apiKey: string): void {
    ApiKeyStorage.setItem(apiKey);
  }

  saveUserLogin(user: UserLogin): void {
    UserStorage.setItem(user);
    this.CurrentStore = user;
    this.emitChange();
  }

  logout(): void {
    LocalStorage.removeAll();
    this.CurrentStore = null;
    this.emitChange();
  }
}

export type {
  UserLogin
};

export default new AuthStore();
