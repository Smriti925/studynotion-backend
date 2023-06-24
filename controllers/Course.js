const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const uploadImageToCloudinary = require("../utils/imageUploader");

//create course
exports.createCourse = async (req, res) => {
  try {
    const { courseName, courseDescription, whatYouWillLearn, price, category } =
      req.body;

    //get thumbnail
    const thumbnail = req.files.thumbnailImage;

    //validation
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !category ||
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

    //check given category is valid or not
    //category contains id (check schema)
    const categoryDetails = await Category.findById(category);
    if (!categoryDetails) {
      return res.status(404).json({
        success: false,
        message: "category details not found",
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
      //category:category or category id from categoryDetails
      category: categoryDetails._id,
      thumbnail: thumbnailImage.secure_url,
    });

    //add new course to the user schema of Instructor
    await User.findByIdAndUpdate(
      { _id: instructorDetails._id },
      { $push: { courses: newCourse._id } },
      { new: true }
    );

    //update Category schema
    await Category.findByIdAndUpdate(
      { _id: categoryDetails._id },
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

//getAllCourses handler function

exports.showAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find(
      {},
      {
        courseName: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingAndReviews: true,
        studentsEnrolled: true,
      }
    )
      .populate("instructor")
      .exec();

    return res.status(200).json({
      success: success,
      message: "Data for all courses fetched successfully",
      data: allCourses,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Cannot fetch all courses",
      error: error.message,
    });
  }
};
