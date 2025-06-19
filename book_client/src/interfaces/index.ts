import { CSSProperties, ReactNode } from 'react';
import { SCREEN_SIZE } from 'enums';

export type HaveLoadedFnType = () => boolean;

export type ResetPasswordFieldType = {
  email: string;
  oldPassword: string;
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

export type ModalSlotPropsType = {
  onClose: () => void;
};

export type ModalPropsType = {
  title: string;
  children: ReactNode[] | ReactNode;
  size?: SCREEN_SIZE;
  headerClass?: string;
  bodyClass?: string;
  footerClass?: string;
  headerStyle?: CSSProperties;
  bodyStyle?: CSSProperties;
  footerStyle?: CSSProperties;
  onOpen?: () => void;
  onClose: () => void;
};

export type NavLinkPropsType = {
  path: string;
  label: string;
  image: string;
  children?: NavLinkPropsType[];
};
