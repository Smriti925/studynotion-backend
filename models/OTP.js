const mongoose = require("mongoose");

const OTPSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now(), expires: 5 * 60 },
});

//to send email
//after schema, before module
async function sendVerification(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      "Verification Email from Study Notion",
      otp
    );
    console.log("Email sent successfully", mailResponse);
  } catch (error) {
    console.log("error in sending email ", error);
    throw error;
  }
}

//pre-middleware
//send email before otp save in db
OTPSchema.pre("save", async function (next) {
  await sendVerification(this.email, this.otp);
  next();
});

module.exports = mongoose.model("OTP", OTPSchema);
