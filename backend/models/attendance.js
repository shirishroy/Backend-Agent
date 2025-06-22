const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  attended: Boolean
});

module.exports = mongoose.model('Attendance', attendanceSchema);
