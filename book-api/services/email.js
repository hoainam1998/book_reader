const nodemailer = require('nodemailer');

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

  constructor() {
    if (EmailService.self) {
      throw new Error(`${this.constructor.name} already created!`);
    }
  }

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

  static sendOtpEmail(email, otp) {
    const subject = 'Your OTP';
    const html = `
      <h2>Your OTP code are: ${otp}</h2>
    `;
    return this.self._sendEmail(email, subject, html);
  }

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
