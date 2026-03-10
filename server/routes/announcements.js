const express = require('express');
const Announcement= require('../models/Announcement');
const Class = require('../models/Class');
const auth = require('../middleware/auth');

const router= express.Router();

// Create an announcement
router.post('/', auth, async (req, res) => {
 try {
 const { classId, message } = req.body;
 
 // Verify user is a tutor and owns the class
 const cls = await Class.findById(classId);
 if (!cls) {
 return res.status(404).json({ message: 'Class not found' });
 }
 
 if (cls.tutorId.toString() !== req.userId) {
 return res.status(403).json({ message: 'Not authorized' });
 }
 
 const announcement= new Announcement({
  classId,
  tutorId: req.userId,
  message
 });
 
 await announcement.save();
 res.status(201).json(announcement);
 } catch (error) {
 res.status(500).json({ message: error.message });
 }
});

// Get announcements for a class
router.get('/class/:classId', auth, async (req, res) => {
 try {
 const announcements = await Announcement.find({ classId: req.params.classId })
  .populate('tutorId', 'name')
  .sort({ createdAt: -1 });
 res.json(announcements);
 } catch (error) {
 res.status(500).json({ message: error.message });
 }
});

module.exports = router;
