const nodemailer = require("nodemailer");
const danZ = "";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: '',
    pass: ""
  }
});

module.exports = class Email {
  sendError(err) {
    console.log("Sending error email.");

    return transporter.sendMail({
      to: danZ,
      from: danZ,
      subject: "Scraper Error",
      html: `<p>${err}</p>`
    });
  }
};
