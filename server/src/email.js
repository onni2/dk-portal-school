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
    from: `"dk Gátt" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Velkomin/n í dk Gáttina",
    html: `
      <p>Hæ ${name},</p>
      <p>Þú hefur fengið aðgang að dk Gáttinni.</p>
      <p>
        Notendanafn: <strong>${username}</strong><br>
        Tímabundið lykilorð: <strong>${password}</strong>
      </p>
      <p>Skráðu þig inn og breyttu lykilorðinu við fyrstu innskráningu.</p>
      <p>— dk</p>
    `,
  });
}

async function sendPasswordResetEmail(to, name, resetUrl) {
  if (!transporter) {
    console.log(`[Email] Password reset — to: ${to}  url: ${resetUrl}`);
    return;
  }
  await transporter.sendMail({
    from: `"dk Gátt" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Endurstilla lykilorð",
    html: `
      <p>Hæ ${name},</p>
      <p>Við fengum beiðni um að endurstilla lykilorðið þitt í dk Gáttinni.</p>
      <p><a href="${resetUrl}">Smelltu hér til að velja nýtt lykilorð</a></p>
      <p>Þessi tengill gildir í 1 klukkustund. Ef þú baðst ekki um þetta, hunsa þennan tölvupóst.</p>
      <p>— dk</p>
    `,
  });
}

module.exports = { sendInviteEmail, sendPasswordResetEmail };
