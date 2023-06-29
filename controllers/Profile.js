const Profile = require("../models/Profile");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/fileUploader");

exports.updateProfile = async (req, res) => {
  try {
    const { gender = "", contactNumber, dateOfBirth, about = "" } = req.body;

    //get userId
    const id = req.user.id;
    if (!contactNumber || !dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: "All files required",
      });
    }

    //find profile
    const userDetails = await User.findById(id);
    const profile = await Profile.findById(userDetails.additionalDetails);

    //update profile using save()
    profile.dateOfBirth = dateOfBirth;
    profile.about = about;
    profile.gender = gender;
    profile.contactNumber = contactNumber;

    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Profile updation failed",
      error: error.message,
    });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    //get id
    const id = req.user.id;
    const userDetails = await User.findById(id);
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    //delete profile
    await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });

    //todo: unenroll from enrolled courses

    //delete user
    await User.findByIdAndDelete({ _id: id });

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      success: false,
      message: "User deletion failed",
      error: error.message,
    });
  }
};

exports.getAllUserDetails = async (req, res) => {
  try {
    //get id
    const id = req.user.id;

    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec();

    return res.status(200).json({
      success: true,
      message: "All users feteched successfully",
      data: userDetails,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "User fetching failed",
      error: error.message,
    });
  }
};

exports.updateDisplayPicture = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture;
    const userId = req.user.id;
    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    );
    console.log(image);
    const updatedProfile = await User.findByIdAndUpdate(
      { _id: userId },
      { image: image.secure_url },
      { new: true }
    );
    res.send({
      success: true,
      message: `Image Updated successfully`,
      data: updatedProfile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    const userDetails = await User.findOne({
      _id: userId,
    })
      .populate("courses")
      .exec();
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find user with id: ${userDetails}`,
      });
    }
    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
