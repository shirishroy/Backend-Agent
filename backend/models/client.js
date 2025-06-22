// models/client.js
const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  enrolledServices: [{
    courseId: mongoose.Schema.Types.ObjectId,
    status: String
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Client', clientSchema);
