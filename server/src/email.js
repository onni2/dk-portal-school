const nodemailer = require("nodemailer");

const transporter =
  process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD
    ? nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      })
    : null;

async function sendInviteEmail(to, name, username, password) {
  if (!transporter) {
    console.log(
      `[Email] Invite — to: ${to}  username: ${username}  password: ${password}`,
    );
    return;
  }
  await transporter.sendMail({
    from: `"DK Gátt" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Velkomin/n í DK Gáttina",
    html: `
      <p>Hæ ${name},</p>
      <p>Þú hefur fengið aðgang að DK Gáttinni.</p>
      <p>
        Notendanafn: <strong>${username}</strong><br>
        Tímabundið lykilorð: <strong>${password}</strong>
      </p>
      <p>Skráðu þig inn og breyttu lykilorðinu við fyrstu innskráningu.</p>
      <p>— DK</p>
    `,
  });
}

module.exports = { sendInviteEmail };
