import nodemailer from 'nodemailer';
import config from '../config';

export const sendEmail = async (to: string, html: string, subject: string) => {
  const transporter = nodemailer.createTransport({
    host: config.email_host,
    port: Number(config.email_port),
    auth: {
      user: config.email_user,
      pass: config.email_pass,
    },
    tls: {
      rejectUnauthorized: false, 
    },
  });

  const mailOptions = {
    from: `"ResearchUstad" <${config.email_user}>`,
    to,
    subject,
    html,
  };

  return transporter.sendMail(mailOptions);
};

