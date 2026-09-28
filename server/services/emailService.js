const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const sendVerificationOtp = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: `"Expense Tracker" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your Expense Tracker account",

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 500px;
          margin: auto;
          padding: 25px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
        ">

          <h2 style="margin-bottom: 10px;">
            Verify your email
          </h2>

          <p>
            Thank you for registering with Expense Tracker.
          </p>

          <p>
            Your verification OTP is:
          </p>

          <div style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            padding: 15px;
            text-align: center;
            background: #f3f4f6;
            border-radius: 8px;
            margin: 20px 0;
          ">
            ${otp}
          </div>

          <p>
            This OTP is valid for <strong>10 minutes</strong>.
          </p>

          <p>
            If you did not create this account, you can ignore this email.
          </p>

          <hr style="margin: 25px 0;" />

          <p style="font-size: 12px; color: #6b7280;">
            Expense Tracker
          </p>

        </div>
      `,
    });

    console.log(`Verification OTP sent to ${email}`);
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error("Failed to send verification email");
  }
};
const sendPasswordResetOtp = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: `"Expense Tracker" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset OTP - Expense Tracker",

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 500px;
          margin: auto;
          padding: 25px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
        ">

          <h2>Password Reset</h2>

          <p>
            We received a request to reset your
            Expense Tracker password.
          </p>

          <p>
            Your password reset OTP is:
          </p>

          <div style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            padding: 15px;
            text-align: center;
            background: #f3f4f6;
            border-radius: 8px;
            margin: 20px 0;
          ">
            ${otp}
          </div>

          <p>
            This OTP is valid for
            <strong>10 minutes</strong>.
          </p>

          <p>
            If you did not request a password reset,
            you can safely ignore this email.
          </p>

          <hr />

          <p style="
            font-size: 12px;
            color: #6b7280;
          ">
            Expense Tracker
          </p>

        </div>
      `,
    });

    // console.log(`Password reset OTP sent to ${email}`);
  } catch (error) {
    console.error("Password reset email error:", error);

    throw new Error("Failed to send password reset email");
  }
};
module.exports = {
  sendVerificationOtp,
  sendPasswordResetOtp,
};
