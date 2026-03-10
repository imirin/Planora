const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
 className: {
  type: String,
 required: true,
 trim: true
 },
 subject: {
  type: String,
 required: true,
 trim: true
 },
 tutorId: {
  type: mongoose.Schema.Types.ObjectId,
 ref: 'User',
 required: true
 },
 joinCode: {
  type: String,
 required: true,
 unique: true
 },
 students: [{
  type: mongoose.Schema.Types.ObjectId,
 ref: 'User'
 }],
 createdAt: {
  type: Date,
 default: Date.now
 }
});

// Generate unique join code
classSchema.methods.generateJoinCode = function() {
 const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
 let code = '';
 for (let i = 0; i < 6; i++) {
 code += chars.charAt(Math.floor(Math.random() * chars.length));
 }
 return code;
};

module.exports = mongoose.model('Class', classSchema);
