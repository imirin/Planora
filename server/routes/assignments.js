const express = require('express');
const Assignment = require('../models/Assignment');
const Class = require('../models/Class');
const auth = require('../middleware/auth');

const router= express.Router();

// Create an assignment
router.post('/', auth, async (req, res) => {
 try {
 const { classId, title, description, duration, deadline } = req.body;
 
 // Verify user is a tutor and owns the class
 const cls = await Class.findById(classId);
 if (!cls) {
 return res.status(404).json({ message: 'Class not found' });
 }
 
 if (cls.tutorId.toString() !== req.userId) {
 return res.status(403).json({ message: 'Not authorized' });
 }
 
 const assignment = new Assignment({
  classId,
  tutorId: req.userId,
  title,
  description,
  duration,
  deadline
 });
 
 await assignment.save();
 res.status(201).json(assignment);
 } catch (error) {
 res.status(500).json({ message: error.message });
 }
});

// Get assignments for a class
router.get('/class/:classId', auth, async (req, res) => {
 try {
 const assignments = await Assignment.find({ classId: req.params.classId })
  .populate('tutorId', 'name')
  .sort({ createdAt: -1 });
 res.json(assignments);
 } catch (error) {
 res.status(500).json({ message: error.message });
 }
});

// Delete an assignment
router.delete('/:id', auth, async (req, res) => {
 try {
 const assignment = await Assignment.findById(req.params.id);
 if (!assignment) {
 return res.status(404).json({ message: 'Assignment not found' });
 }
 
 // Verify tutor owns the assignment
 if (assignment.tutorId.toString() !== req.userId) {
 return res.status(403).json({ message: 'Not authorized' });
 }
 
 await Assignment.findByIdAndDelete(req.params.id);
 res.json({ message: 'Assignment deleted successfully' });
 } catch (error) {
 res.status(500).json({ message: error.message });
 }
});

module.exports = router;
