const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  instructor: String,
  scheduledAt: Date,
  duration: Number, // in minutes
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' }
});

module.exports = mongoose.model('Class', classSchema);
