const transporter = require("../config/mail");

async function sendTransactionEmail(userEmail, name, amount, toAccount) {
  const subject = "Transaction Successful!";

  const text = `
Hello ${name},

Your transaction of ₹${amount} to account ${toAccount} was successful.

Thank you for using Backend Ledger.
`;

  const html = `
    <h2>Transaction Successful!</h2>

    <p>Hello <strong>${name}</strong>,</p>

    <p>Your transaction has been completed successfully.</p>

    <table border="1" cellpadding="8" cellspacing="0">
      <tr>
        <td><strong>Amount</strong></td>
        <td>₹${amount}</td>
      </tr>
      <tr>
        <td><strong>Transferred To</strong></td>
        <td>${toAccount}</td>
      </tr>
    </table>

    <br>

    <p>Thank you for using <strong>Backend Ledger</strong>.</p>
  `;

  await transporter.sendMail({
    from: `"Backend Ledger" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject,
    text,
    html,
  });

  console.log("Transaction email sent.");
}

module.exports = sendTransactionEmail;