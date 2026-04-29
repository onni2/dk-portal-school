const { Resend } = require("resend");

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function sendInviteEmail(to, name, username, password) {
  if (!resend) {
    console.log(`[Email] Invite — username: ${username}  password: ${password}  to: ${to}`);
    return;
  }
  await resend.emails.send({
    from: "DK Gátt <portal@dk.is>",
    to,
    subject: "Velkomin/n í DK Gáttina",
    html: `<p>Hæ ${name},</p>
<p>Aðgangur þinn að DK Gáttinni hefur verið stofnaður.</p>
<p>Notendanafn: <strong>${username}</strong><br>
Tímabundið lykilorð: <strong>${password}</strong></p>
<p>Vinsamlegast skráðu þig inn og breyttu lykilorðinu við fyrstu innskráningu.</p>
<p>— DK</p>`,
  });
}

module.exports = { sendInviteEmail };
