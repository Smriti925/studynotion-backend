const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");

//capture the payment and initiate the razorpay order
exports.capturePayment = async (req, res) => {
  const { course_id } = req.body;
  const userId = req.user.id; //is string

  if (!course_id) {
    return res.json({
      success: false,
      message: "Please provide valid course Id",
    });
  }

  let course;
  try {
    course = await Course.findById(course_id);
    if (!course) {
      return res.json({
        success: false,
        message: "Couln't find the course",
      });
    }

    //user already paid for the same course

    //convert string to objectId
    const uid = new mongoose.Types.ObjectId(userId);
    if (course.studentsEnrolled.includes(uid)) {
      return res.json({
        success: false,
        message: "Student is already enrolled",
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: error.message,
    });
  }

  //order create

  const amount = course.price;
  const currency = "INR";

  const options = {
    amount: (amount = 100),
    currency,
    receipt: Math.random(Date.now()).toString(),
    notes: {
      courseId: course_id,
      userId,
    },
  };

  try {
    //initiate the payment using razorpay
    const paymentResponse = await instance.orderes.create(options);
    console.log(paymentResponse);

    return res.status(200).json({
      success: true,
      courseName: course.courseName,
      courseDescription: course.courseDescription,
      thumbnail: course.thumbnail,
      orderId: paymentResponse.id,
      currency: paymentResponse.currency,
      amount: paymentResponse.amount,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

//verify signature of Razorpay and server

exports.verifySignature = async (req, res) => {
  const webhookSecret = "12345678";
  const signature = req.header["x-razorpay-signature"];
  //algo used, algo, secret key
  const shasum = crypto.createHmac("sha256", webhookSecret);

  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  if (signature === digest) {
    console.log("Payment is Authorized");

    const { courseId, userId } = req.body.payload.payment.entity.notes;

    try {
      //fulfil the action
      //find the course and enroll the student in it
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $push: { studentsEnrolled: userId } },
        { new: true }
      );

      if (!enrolledCourse) {
        return res.json({
          success: false,
          message: "course not found",
        });
      }

      console.log(enrolledCourse);

      //find the student add the course to their list of enrolled course
      const enrolledStudent = await User.findOneAndUpdate(
        { _id: userId },
        { $push: { courses: courseId } },
        { new: true }
      );

      console.log(enrolledStudent);

      //confirmation mail send

      const emailResponse = await mailSender(
        enrolledStudent.email,
        "Congratulations, you are onboarded into Course"
      );

      console.log(emailResponse);
      return res.json({
        success: true,
        message: "Signature verified and course added",
      });
    } catch (error) {
      console.log(error);
      return res.json({
        success: false,
        message: error.message,
      });
    }
  } else {
    return res.status(400).json({
      success: false,
      message: "Invalid request",
    });
  }
};
