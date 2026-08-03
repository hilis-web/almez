const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  visitorId: String,
  language: String,
  page: String,
  eventType: String, // "start" أو "end"
  duration: Number, // مدة الجلسة بالثواني
  timestamp: { type: Date, default: Date.now },
});

const Visit = mongoose.model("Visit", visitSchema);
module.exports = Visit;
