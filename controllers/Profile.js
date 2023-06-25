const Profile = require("../models/Profile");
const User = require("../models/User");

exports.updateProfile = async (req, res) => {
  try {
    const { gender, contactNumber, dateOfBirth = "", about = "" } = req.body;

    //get userId
    const id = req.user.id;
    if (!contactNumber || !gender || !id) {
      return res.status(400).json({
        success: false,
        message: "All files required",
      });
    }

    //find profile
    const userDetails = await User.findById(id);
    const profileId = userDetails.additionalDetails;
    const profileDetails = await Profile.findById(profileId);

    //update profile using save()
    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.gender = gender;
    profileDetails.contactNumber = contactNumber;
    await profileDetails.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      updatedCourseDetails,
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

exports.getAllUserDetail = async (req, res) => {
  try {
    //get id
    const id = req.user.id;

    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec();

    return res.status(200).json({
      success: true,
      message: "All users feteched successfully",
      error: error.message,
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
