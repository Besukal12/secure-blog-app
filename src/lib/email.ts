import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

export async function sendEmail(to: string, subject: string, text: string) {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_PORT ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    throw new Error("SMTP configuration is missing please set it.");
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FORM;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: false,
    auth: {
      user,
      pass,
    },
  });

  await transporter.sendMail({
    from: from,
    to,
    subject,
    html: text,
  });
}

export async function sendEmailWithTemplate(
  to: string,
  subject: string,
  templateName: string,
  variables: Record<string, string>
) {
  const templatePath = path.join(__dirname, "../templates", `${templateName}.html`);

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template ${templateName} not found`);
  }

  let htmlContent = fs.readFileSync(templatePath, "utf-8");

  // Replace variables in the template
  for (const [key, value] of Object.entries(variables)) {
    htmlContent = htmlContent.replace(new RegExp(`{{${key}}}`, "g"), value);
  }

  await sendEmail(to, subject, htmlContent);
}
