import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: parseInt(SMTP_PORT!),
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export const sendMagicLinkEmail = async (email: string, url: string): Promise<void> => 
{
  const mailOptions = {
    from: `"Social Story Generator" <${SMTP_USER}>`,
    to: email,
    subject: "Sign In Link for Social Story Generator",
    html: `
      <p>Click the link below to sign in:</p>
      <a href="${url}">Sign In</a>
    `,
  };

  await transporter.sendMail(mailOptions);
};
