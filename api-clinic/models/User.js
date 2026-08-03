const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: false },
  email: { type: String, required: false },
  phone: { type: String, required: false },
  contactMethod: { type: String, required: false },
  // consultationType: { type: String, required: false },

  consultationType: {
    type: String,
    required: true,
  },

  // consultationReason: {
  //   type: String,
  //   required: true,
  // },

  additionalInfo: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
