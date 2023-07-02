const express = require("express");
const router = express.Router();

// Import the Controllers

const {
  createCourse,
  getAllCourses,
  getCourseDetails,
} = require("../controllers/Course");

// Categories Controllers Import
const {
  createCategory,
  showAllCategories,
  categoryPageDetails,
} = require("../controllers/Category");

const {
  createSection,
  updateSection,
  deleteSection,
} = require("../controllers/Section");

const {
  createSubSection,
  updateSubSection,
  deleteSubSection,
} = require("../controllers/Subsection");

const {
  createRating,
  getAverageRating,
  getAllRating,
} = require("../controllers/RatingAndReview");

// Importing Middlewares
const {
  auth,
  isInstructor,
  isStudent,
  isAdmin,
} = require("../middlewares/auth");

//   Course routes

// Courses can Only be Created by Instructors
router.post("/createCourse", auth, isInstructor, createCourse);
// Get all Registered Courses
router.get("/getAllCourses", getAllCourses);
// Get Details for a Specific Courses
router.post("/getCourseDetails", getCourseDetails);

//Add a Section to a Course
router.post("/addSection", auth, isInstructor, createSection);
// Update a Section
router.post("/updateSection", auth, isInstructor, updateSection);
// Delete a Section
router.post("/deleteSection", auth, isInstructor, deleteSection);

// Add a Sub Section to a Section
router.post("/addSubSection", auth, isInstructor, createSubSection);
// Edit Sub Section
router.post("/updateSubSection", auth, isInstructor, updateSubSection);
// Delete Sub Section
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection);

//  Category routes (Only by Admin)

// Category can Only be Created by Admin
// TODO: Put IsAdmin Middleware here
router.post("/createCategory", auth, isAdmin, createCategory);
router.get("/showAllCategories", showAllCategories);
router.post("/getCategoryPageDetails", categoryPageDetails);

//Rating and Review

router.post("/createRating", auth, isStudent, createRating);
router.get("/getAverageRating", getAverageRating);
router.get("/getReviews", getAllRating);

module.exports = router;
