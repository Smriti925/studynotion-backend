const cloudinary = require("cloudinary").v2;

//file in params below could be image/video
exports.uploadFileToCloudinary = async (file, folder, height, quality) => {
  const options = { folder };
  //for compression
  if (height) {
    options.height = height;
  }
  if (quality) {
    options.quality = quality;
  }

  options.resource_type = "auto";

  return await cloudinary.v2.uploader.upload(file.tempFilePath, options);
};
