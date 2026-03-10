const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
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
 title: {
  type: String,
 required: true,
 trim: true
 },
 description: {
  type: String,
 required: true
 },
 duration: {
  type: Number, // in minutes
 required: true
 },
 deadline: {
  type: Date,
 required: true
 },
 createdAt: {
  type: Date,
 default: Date.now
 }
});

module.exports = mongoose.model('Assignment', assignmentSchema);
