/* eslint-disable no-unused-vars */
export enum SCREEN_SIZE {
  LARGE = 'lg',
  MEDIUM = 'md',
  SMALL = 'sm',
};

export enum UNAUTHORIZED_ERROR_CODE {
  CREDENTIAL_NOT_MATCH = 'CREDENTIAL_NOT_MATCH',
  HAVE_NOT_LOGIN = 'HAVE_NOT_LOGIN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  WORKING_SESSION_ENDED = 'WORKING_SESSION_ENDED',
};

export enum NOT_FOUND_ERROR_CODE {
  URL_NOT_FOUND = 'URL_NOT_FOUND',
};

export enum SOCKET_NAME {
  USER = 'user',
  CLIENT = 'client',
};

export enum Role {
  SUPER_ADMIN = 'Super Admin',
  ADMIN = 'Admin',
  USER = 'User',
};

export enum Block {
  OFF,
  ON,
};
