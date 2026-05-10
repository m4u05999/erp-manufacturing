import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: Number(process.env.SMTP_PORT) || 1025,
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS || "" }
    : undefined,
});

export async function sendEmail(to: string, subject: string, html: string) {
  if (process.env.NOTIFICATION_EMAIL_ENABLED !== "true") return;
  await transport.sendMail({
    from: process.env.SMTP_FROM || "noreply@erp-manufacturing.local",
    to,
    subject,
    html,
  }).catch((err) => console.error("Email send failed:", err.message));
}
