export type HaveLoadedFnType = () => boolean;

export type ResetPasswordFieldType = {
  email: string;
  password: string;
  passwordAgain: string;
};

export type UserType = {
  userId?: string,
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  mfa: boolean;
  sex: number;
  power: boolean;
};
