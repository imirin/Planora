const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
 classId: {
  type: mongoose.Schema.Types.ObjectId,
 ref: 'Class',
 required: true
 },
 tutorId: {
  type: mongoose.Schema.Types.ObjectId,
 ref: 'User',
 required: true
 },
 message: {
  type: String,
 required: true
 },
 createdAt: {
  type: Date,
 default: Date.now
 }
});

module.exports = mongoose.model('Announcement', announcementSchema);
