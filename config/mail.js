require('dotenv').config();
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_ADD,
    pass: process.env.MAIL_PASS,
  }
});

  module.exports = transporter;