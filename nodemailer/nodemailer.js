import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const sendVerificationEmail = async (email, token) => {
  const verifyURL = `http://localhost:1000/api/users/verify-email/${token}`;

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL, // your email
      pass: process.env.EMAIL_PASS, // your app password
    },
  });

  const message = {
    from: "Online Store v1",
    to: email,
    subject: "Email Verification",
    html: `<h1>Verify your email</h1>
           <p>Click the link below to verify your email:</p>
           <a href="${verifyURL}">${verifyURL}</a>`,
  };

  await transporter.sendMail(message);
};
export default sendVerificationEmail;
