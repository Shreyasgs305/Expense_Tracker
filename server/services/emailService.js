const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "ExpenseTracker <onboarding@resend.dev>";

const sendVerificationOtp = async (email, otp) => {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: "Verify your Expense Tracker account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px;">
          <h2 style="color: #7c3aed;">
            Expense Tracker
          </h2>

          <p>Hello,</p>

          <p>
            Thank you for creating an Expense Tracker account.
            Use the following OTP to verify your email address:
          </p>

          <div style="
            margin: 25px 0;
            padding: 20px;
            background: #f5f3ff;
            border-radius: 10px;
            text-align: center;
          ">
            <span style="
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              color: #7c3aed;
            ">
              ${otp}
            </span>
          </div>

          <p>
            This OTP is valid for <strong>10 minutes</strong>.
          </p>

          <p>
            If you did not create this account, you can safely ignore this email.
          </p>

          <p>
            Regards,<br />
            <strong>Expense Tracker</strong>
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Verification email error:", error);
      throw new Error("Failed to send verification email");
    }

    console.log(`Verification OTP sent to ${email}`, data?.id);
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error("Failed to send verification email");
  }
};

const sendPasswordResetOtp = async (email, otp) => {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: "Password Reset OTP - Expense Tracker",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px;">
          <h2 style="color: #7c3aed;">
            Expense Tracker
          </h2>

          <p>Hello,</p>

          <p>
            We received a request to reset your Expense Tracker password.
          </p>

          <p>
            Use the following OTP to reset your password:
          </p>

          <div style="
            margin: 25px 0;
            padding: 20px;
            background: #f5f3ff;
            border-radius: 10px;
            text-align: center;
          ">
            <span style="
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              color: #7c3aed;
            ">
              ${otp}
            </span>
          </div>

          <p>
            This OTP is valid for <strong>10 minutes</strong>.
          </p>

          <p>
            If you did not request a password reset, you can safely ignore this email.
          </p>

          <p>
            Regards,<br />
            <strong>Expense Tracker</strong>
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Password reset email error:", error);
      throw new Error("Failed to send password reset email");
    }

    console.log(`Password reset OTP sent to ${email}`, data?.id);
  } catch (error) {
    console.error("Password reset email error:", error);
    throw new Error("Failed to send password reset email");
  }
};

module.exports = {
  sendVerificationOtp,
  sendPasswordResetOtp,
};
