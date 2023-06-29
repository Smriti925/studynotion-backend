const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const uploadFileToCloudinary = require("../utils/fileUploader");
require("dotenv").config();

exports.createSubSection = async (req, res) => {
  try {
    const { sectionId, title, description, timeDuration } = req.body;
    //extract file/video, videoFile is name of video
    const video = req.files.videoFile;

    //validation
    if (!sectionId || !title || !description || !timeDuration) {
      return res.status(400).json({
        success: false,
        message: "all fields required in sebsection",
      });
    }

    //upload to cloudinary, (uploadDetails stores the secure url)
    const uploadDetails = await uploadFileToCloudinary(
      video,
      process.env.FOLDER_NAME
    );

    //create a sub-section
    const subSectionDetails = await SubSection.create({
      title: title,
      description: description,
      timeDuration: timeDuration,
      videoUrl: uploadDetails.secure_url,
    });

    //update(push) section with this sub section object Id
    const updatedSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $push: { subSection: subSectionDetails._id },
      },
      { new: true }
    )
      .populate()
      .exec();

    //return response
    return res.status(200).json({
      success: true,
      message: "Sub-section Created Successfully",
      updatedSection,
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

// hw: subsection update and delete
exports.updateSubSection = async (req, res) => {
  try {
    const { subSectionId, title, description, timeDuration } = req.body;
    const video = req.files.videoFile;

    if (!subSectionId || !title || !description || !timeDuration) {
      return res.status(400).json({
        success: false,
        message: "Missing properties",
      });
    }

    //update data
    const subSection = await SubSection.findByIdAndUpdate(
      { _id: subSectionId },
      { title, description, timeDuration, videoUrl },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "SubSection updated successfully",
      updatedCourseDetails,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "SubSection updation failed",
      error: error.message,
    });
  }
};

exports.deleteSubSection = async (req, res) => {
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

//todo: updateSubSection
