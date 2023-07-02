const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadFileToCloudinary } = require("../utils/fileUploader");
require("dotenv").config();

exports.createSubSection = async (req, res) => {
  try {
    const { sectionId, title, description, timeDuration } = req.body;
    //extract file/video, videoFile is name of video
    const video = req.files.video;

    //validation
    if (!sectionId || !title || !description || !video) {
      return res.status(400).json({
        success: false,
        message: "all fields required in Sub-section",
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
      timeDuration: `${uploadDetails.duration}`,
      videoUrl: uploadDetails.secure_url,
    });

    //update(push) section with this sub section object Id
    const updatedSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $push: { subSection: subSectionDetails._id },
      },
      { new: true }
    ).populate("subSection");

    //return response
    return res.status(200).json({
      success: true,
      message: "Sub-section Created Successfully",
      data: updatedSection,
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

// hw: subsection update and delete
exports.updateSubSection = async (req, res) => {
  try {
    const { sectionId, title, description } = req.body;
    const subSection = await SubSection.findById(sectionId);

    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }

    if (title !== undefined) {
      subSection.title = title;
    }

    if (description !== undefined) {
      subSection.description = description;
    }
    if (req.files && req.files.video !== undefined) {
      const video = req.files.video;
      const uploadDetails = await uploadFileToCloudinary(
        video,
        process.env.FOLDER_NAME
      );
      subSection.videoUrl = uploadDetails.secure_url;
      subSection.timeDuration = `${uploadDetails.duration}`;
    }

    await subSection.save();

    return res.json({
      success: true,
      message: "Section updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the section",
      error: error.message,
    });
  }
};

exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionId, sectionId } = req.body;
    await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $pull: {
          subSection: subSectionId,
        },
      }
    );
    const subSection = await SubSection.findByIdAndDelete({
      _id: subSectionId,
    });

    if (!subSection) {
      return res
        .status(404)
        .json({ success: false, message: "SubSection not found" });
    }

    return res.json({
      success: true,
      message: "SubSection deleted successfully",
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
