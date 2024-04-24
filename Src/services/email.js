import nodemailer from "nodemailer";

export async function sendEmail(to, subject, html) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SEND_EMAIL,
      pass: process.env.SEND_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: `"Medical Clinic: " <${process.env.SEND_EMAIL}>`,
    to,
    subject,
    html,
  });

  return info;
}
