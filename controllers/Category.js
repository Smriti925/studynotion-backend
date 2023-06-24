const Category = require("../models/Category");

//Category handler function
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    //create entry
    const categoryDetails = await Category.create({
      name: name,
      description: description,
    });
    console.log(categoryDetails);

    res.status(200).json({
      success: true,
      message: "Category created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//getAllCategory handler function

exports.showAllCategory = async (req, res) => {
  try {
    const allCategory = await Category.find({ name: true, description: true });
    console.log(allCategory);

    res.status(200).json({
      success: true,
      message: "All Category returned successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
