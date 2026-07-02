const transporter = require("../config/mail");

const sendMail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Email Error:", error);
    throw error;
  }
};




module.exports = sendMail;