const { Resend } = require("resend");

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

async function sendInviteEmail(to, name, username, password) {
  if (!resend) {
    console.log(
      `[Email] Invite — to: ${to}  username: ${username}  password: ${password}`,
    );
    return;
  }
  await resend.emails.send({
    from: "DK Gátt <onboarding@resend.dev>",
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
