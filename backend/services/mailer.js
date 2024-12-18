// emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER, // Gmail хаяг
    pass: process.env.EMAIL_PASS, // App Password эсвэл Gmail нууц үг
  },
});

// Баталгаажуулах код илгээх функц
const sendVerificationEmail = (email, verificationCode) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify Your Email',
    text: `Your verification code is ${verificationCode}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

// Амжилттай бүртгэлийн мэйл илгээх функц
const sendSuccessEmail = (email, firstName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Таны багш болох эрх нээгдлээ',
    text: `Эрхэм хүндэт ${firstName},\n\nтанд баяр хүргэе. Та одоо өөрийн бүртгэлээр нэвтэрч хичээл заах бүрэн боломжтой боллоо`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

// Хүсэлтийн татгалзах имэйл илгээх функц
const sendRejectionEmail = (email) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Багшаар бүртгэх хүсэлт татгалзсан',
    text: 'Таны багшаар бүртгэх хүсэлт татгалзлаа. Хэрэв танд асуух зүйл байвал бидэнтэй холбоо барина уу.',
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

module.exports = { sendVerificationEmail, sendSuccessEmail, sendRejectionEmail };
