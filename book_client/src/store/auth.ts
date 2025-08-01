import Store from './store';
import { SilentPromise } from 'services';
import startSocket from 'services/socket-setup';
import WebSocketInit from 'services/web-socket';
import { Role } from 'enums';
import { UserLogin, ApiKeyStorage, UserStorage, Storage } from 'storage';

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
      return this.CurrentStore!.mfaEnable;
    }
    return false;
  }

  get PasswordMustChange() {
    if (this.isContainData('passwordMustChange')) {
      return this.CurrentStore!.passwordMustChange;
    }
    return false;
  }

  get ResetPasswordToken() {
    if (this.isContainData('resetPasswordToken')) {
      return this.CurrentStore!.resetPasswordToken;
    }
    return null;
  }

  get ApiKey() {
    return ApiKeyStorage.getItem();
  }

  get IsAdmin() {
    if (this.isContainData('role')) {
      return ([Role.ADMIN, Role.SUPER_ADMIN] as string[]).includes(this.CurrentStore!.role);
    }
    return false;
  }

  get Role() {
    if (this.isContainData('role')) {
      return this.CurrentStore!.role;
    }
    return Role.USER;
  }

  get UserId() {
    if (this.isContainData('userId')) {
      return this.CurrentStore!.userId;
    }
    return null;
  }

  destroyResetPasswordToken(): void {
    if (this.isContainData('resetPasswordToken')) {
      this.CurrentStore!.resetPasswordToken = null;
      UserStorage.setItem(this.CurrentStore!);
    }
  }

  saveApiKey(apiKey: string): void {
    ApiKeyStorage.setItem(apiKey);
    startSocket();
  }

  saveUserLogin(user: UserLogin): void {
    UserStorage.setItem(user);
    this.CurrentStore = user;
    this.emitChange();
  }

  logout(): void {
    WebSocketInit.close(this.CurrentStore?.userId);
    Storage.removeAll();
    SilentPromise.clearRequestMemory();
    this.CurrentStore = null;
  }
}

export type {
  UserLogin
};

export default new AuthStore();
