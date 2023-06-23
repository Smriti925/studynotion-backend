//reset password -> link generate-> mail send -> open -> UI -> newPwd -> update

const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");

// reset password token

exports.resetPasswordToken = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await user.findOne({ email: email });
    if (!user) {
      return res.json({
        success: false,
        message: "Email is not registered with us",
      });
    }

    //generate token
    const token = crypto.randomUUID();
    //update user by adding token and expiration time
    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      { new: true }
    );

    const url = `http://localhost:3000/update-password/${token}`;

    //send mail containing the url
    await mailSender(email, "Password Reset Link", `Link : ${url}`);

    //return response
    return res.json({
      success: true,
      message:
        "Email send successfully, Please check email and change password",
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Something went wrong while sending email for password reset",
    });
  }
};

//reset password
exports.resetPassword = async (req, res) => {
  //data fetch
  try {
    const { password, confirmPassword, token } = req.body;

    //data validation
    if (password !== confirmPassword) {
      return res.json({
        success: false,
        message: "Password not matching",
      });
    }

    //get userdetails from db using token
    const userDetails = await User.findOne({ token: token });

    //if no entry - invalid token
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "Token is invalid",
      });
    }

    //check token expiry time
    if (userDetails.resetPassword < Date.now()) {
      return res.json({
        success: false,
        message: "Token is expired, Please regenerate your token",
      });
    }

    //hash pwd
    const hashedPassword = await bcrypt.hash(password, 10);

    //password update
    await User.findOneAndUpdate(
      { token: token },
      { password: hashedPassword },
      { new: true }
    );

    //return response
    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: true,
      message: "Reset password unsuccessful",
    });
  }
};
