const nodemailer = require('nodemailer');

const sendMail = (otp, to) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMPT_HOST,
    port: process.env.SMPT_PORT,
    secure: true,
    auth: {
      user: process.env.SMPT_MAIL,
      pass: process.env.SMPT_APP_PASS,
    },
    service: 'gmail',
  });

  const mailOptions = {
    from: process.env.SMPT_MAIL,
    to: to,
    subject: 'Your OTP',
    html: `
      <h2>Your OTP code are: ${otp}
    `,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve('Email sent: ' + info.response);
      }
    })
  });
};

module.exports = sendMail;
