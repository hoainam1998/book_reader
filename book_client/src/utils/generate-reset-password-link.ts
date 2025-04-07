import path from 'router/paths';

/**
 * Return a reset password link.
 *
 * @param {string} token - A reset password token.
 * @return {string} - The reset password link attached token.
 */
export default (token: string) => `${path.RESET_PASSWORD}?token=${token}`;
