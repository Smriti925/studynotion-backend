const Course = require("../models/Course");
const Section = require("../models/Section");

exports.createSection = async (req, res) => {
  try {
    const { sectionName, courseId } = req.body;

    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Missing properties",
      });
    }

    //create section
    const newSection = await Section.create({ sectionName });

    //update course with section objectId
    const updatedCourseDetails = await Course.findByIdAndUpdate(
      courseId,
      { $push: { courseContent: newSection._id } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Section created successfully",
      updatedCourseDetails,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Section creation failed",
      error: error.message,
    });
  }
};

exports.updateSection = async (req, res) => {
  try {
    const { sectionName, sectionId } = req.body;

    if (!sectionName || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "Missing properties",
      });
    }

    //update data
    const section = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Section updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Section updation failed",
      error: error.message,
    });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    //assuming we are sending Id in params
    const { sectionId } = req.params;

    await Section.findByIdAndDelete(sectionId);

    //todo: need to delete the entry from the course schema
    return res.status(200).json({
      success: true,
      message: "Section deleted successfully",
      updatedCourseDetails,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Section deletion failed",
      error: error.message,
    });
  }
};
