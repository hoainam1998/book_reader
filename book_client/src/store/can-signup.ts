import Store from './store';
import { CanSignupStorage } from 'storage';

class CanSignupStore extends Store<boolean> {
  constructor() {
    super(CanSignupStorage.getItem());
  }

  get CanSignup() {
    return this.CurrentStore;
  }

  set CanSignup(value) {
    CanSignupStorage.setItem(value);
    this.CurrentStore = value;
    this.emitChange();
  }
}

export default new CanSignupStore();
