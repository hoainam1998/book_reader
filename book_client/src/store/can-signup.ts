import Store from './store';
import { CanSignupStorage } from 'storage';

class CanSignupStore extends Store<boolean> {
  constructor() {
    super(CanSignupStorage.getItem());
  }

  get CanSignup() {
    return CanSignupStorage.getItem();
  }

  set CanSignup(value) {
    CanSignupStorage.setItem(value);
    this.emitChange();
  }
}

export default new CanSignupStore();
