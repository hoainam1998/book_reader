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
  id?: string;
  children?: NavLinkPropsType[];
  loader?: (item: NavLinkPropsType) => void;
};

export type BookPropsType = {
  name: string;
  avatar: string;
  bookId: string;
  authors: {
    authorId: string;
    name: string;
    avatar: string;
  }[];
};

export type PaginationCondition = {
  id?: string;
  keyword?: string;
};

export type PersonalType = Omit<UserType, 'mfa' | 'power' | 'userId'> & {
  avatar: string;
  id: string;
  mfaEnable: boolean;
};

export type HorizontalBookType = {
  name: string;
  avatar: string;
  bookId: string;
  createAt?: number;
  authors: {
    name: string;
    authorId: string;
  }[];
  deleteBook: () => void;
};
