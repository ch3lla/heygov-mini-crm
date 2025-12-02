import "dotenv/config";
import nodemailer from 'nodemailer';
import { Resend } from "resend";

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: `"HeyGov Assistant" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Error sending email:", error);
      return false
    } else {
      console.log("Email sent: %s", data.id);
      return true
    }
    // const info = await transporter.sendMail({
    //   from: `"HeyGov Assistant" <${process.env.EMAIL_USER}>`,
    //   to,
    //   subject,
    //   html,
    // });
    // console.log("Email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

export { sendEmail }