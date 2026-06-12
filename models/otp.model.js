const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const otpTemplate = require("../mail/authMailTemplate");

const otpSchema = new mongoose.Schema({
  otp: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

otpSchema.pre("save", async function (next) {
  await mailSender(
    this.email,
    "Verify Your Email - Tender247",
    otpTemplate(this.otp),
  );
});

module.exports = mongoose.model("OTP", otpSchema);
