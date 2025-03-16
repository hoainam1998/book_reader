const nodemailer = require('nodemailer');

/**
 * Class supported sending email.
 */
class EmailService {
  _transporter = nodemailer.createTransport({
    host: process.env.SMPT_HOST,
    port: process.env.SMPT_PORT,
    secure: true,
    auth: {
      user: process.env.SMPT_MAIL,
      pass: process.env.SMPT_APP_PASS,
    },
    service: 'gmail',
  });

  static self = new EmailService();

  /**
  * Create email service instance if it not exist.
  */
  constructor() {
    if (EmailService.self) {
      throw new Error(`${this.constructor.name} already created!`);
    }
  }

  /**
  * Send email util.
  *
  * @param {string} to - The receiver.
  * @param {string} subject - The email subject.
  * @param {string} html - The email content.
  * @return {Promise} - The email sent result.
  */
  _sendEmail(to, subject, html) {
    const mailOptions = {
      from: process.env.SMPT_MAIL,
      to: to,
      subject,
      html
    };

    return new Promise((resolve, reject) => {
      this._transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          reject(error);
        } else {
          resolve(`Email sent: ${info.response}`);
        }
      });
    });
  }

  /**
  * Sending email attach otp code.
  * @static
  * @param {string} email - The receiver.
  * @param {string} otp - The otp code.
  * @return {Promise} - The email sent result.
  */
  static sendOtpEmail(email, otp) {
    const subject = 'Your OTP';
    const html = `
      <h2>Your OTP code are: ${otp}</h2>
    `;
    return this.self._sendEmail(email, subject, html);
  }

  /**
  * Sending email contain reset password link.
  * @static
  * @param {string} email - The receiver.
  * @param {string} link - The reset password link.
  * @return {Promise} - The email sent result.
  */
  static sendResetPasswordEmail(email, link) {
    const subject = 'Reset password';
    const html = `
      <h3>Click this link to navigate to reset password page</h3>
      <a href=${link} target="_blank">${link}</a>
    `;
    return this.self._sendEmail(email, subject, html);
  }
}

module.exports = EmailService;
