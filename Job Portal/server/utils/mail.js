const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.JOB_EMAIL,
    pass: process.env.APP_PASS,
  },
});

const sendMail = async (to, subject, body) => {
  const mailOptions = {
    from: process.env.JOB_EMAIL,
    to: to,
    subject: subject,
    html: body,
  };
  try {
    let mail = await transporter.sendMail(mailOptions);
    console.log("Message sent:", mail);
  } catch (error) {
    console.log(error);
    console.log("Error sending mail");
  }
};

module.exports = sendMail;
