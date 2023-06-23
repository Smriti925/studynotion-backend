const Course = require("../models/Course");
const Tag = require("../models/Tags");
const User = require("../models/User");
const uploadImageToCloudinary = require("../utils/imageUploader");

//create course
exports.createCourse = async (req, res) => {
  try {
    const { courseName, courseDescription, whatYouWillLearn, price, tag } =
      req.body;

    //get thumbnail
    const thumbnail = req.files.thumbnailImage;

    //validation
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag ||
      !thumbnail
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    //check for instructor
    const userId = req.user.id; //id from payload
    const instructorDetails = await User.findById(userId);
    console.log("Instructor Details", instructorDetails);

    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "Instructor details not found",
      });
    }

    //check given tag is valid or not
    //tag contains id (check schema)
    const tagDetails = await Tag.findById(tag);
    if (!tagDetails) {
      return res.status(404).json({
        success: false,
        message: "Tag details not found",
      });
    }

    //upload image to cloudinary
    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );

    //create entry for new course
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn: whatYouWillLearn,
      price,
      //tag:tag or tag id from tagDetails
      tag: tagDetails._id,
      thumbnail: thumbnailImage.secure_url,
    });

    //add new course to the user schema of Instructor
    await User.findByIdAndUpdate(
      { _id: instructorDetails._id },
      { $push: { courses: newCourse._id } },
      { new: true }
    );

    //update Tag schema
    await Tag.findByIdAndUpdate(
      { _id: tagDetails._id },
      { $push: { course: newCourse._id } },
      { new: true }
    );

    //return response
    return res.status(200).json({
      success: true,
      message: "Course Cretaed successfully",
      data: newCourse,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Something went wrong while creating Course",
      error: error.message,
    });
  }
};
