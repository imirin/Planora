const express = require('express');
const Class = require('../models/Class');
const User= require('../models/User');
const auth = require('../middleware/auth');

const router= express.Router();

// Create a class
router.post('/', auth, async (req, res) => {
 try {
 const { className, subject } = req.body;
 
 // Verify user is a tutor
 const user= await User.findById(req.userId);
 if (!user || user.role !== 'tutor') {
 return res.status(403).json({ message: 'Only tutors can create classes' });
 }
 
 const newClass = new Class({
  className,
  subject,
  tutorId: req.userId,
  joinCode: new Class().generateJoinCode()
 });
 
 await newClass.save();
 res.status(201).json(newClass);
 } catch (error) {
 res.status(500).json({ message: error.message });
 }
});

// Get all classes for a tutor
router.get('/tutor', auth, async (req, res) => {
 try {
 const classes = await Class.find({ tutorId: req.userId }).sort({ createdAt: -1 });
 res.json(classes);
 } catch (error) {
 res.status(500).json({ message: error.message });
 }
});

// Get all classes for a student
router.get('/student', auth, async (req, res) => {
 try {
 const classes = await Class.find({ students: req.userId }).sort({ createdAt: -1 });
 res.json(classes);
 } catch (error) {
 res.status(500).json({ message: error.message });
 }
});

// Get class by ID
router.get('/:id', auth, async (req, res) => {
 try {
 const cls = await Class.findById(req.params.id).populate('tutorId', 'name email');
 if (!cls) {
 return res.status(404).json({ message: 'Class not found' });
 }
 res.json(cls);
 } catch (error) {
 res.status(500).json({ message: error.message });
 }
});

// Join a class using join code
router.post('/join', auth, async (req, res) => {
 try {
 const { joinCode } = req.body;
 
 const cls = await Class.findOne({ joinCode });
 if (!cls) {
 return res.status(404).json({ message: 'Invalid join code' });
 }
 
 // Check if already a member
 if (cls.students.includes(req.userId)) {
 return res.status(400).json({ message: 'Already a member of this class' });
 }
 
 cls.students.push(req.userId);
 await cls.save();
 
 res.json({ message: 'Successfully joined class', class: cls });
 } catch (error) {
 res.status(500).json({ message: error.message });
 }
});

// Delete a class
router.delete('/:id', auth, async (req, res) => {
 try {
 const cls = await Class.findById(req.params.id);
 if (!cls) {
 return res.status(404).json({ message: 'Class not found' });
 }
 
 // Verify tutor owns the class
 if (cls.tutorId.toString() !== req.userId) {
 return res.status(403).json({ message: 'Not authorized' });
 }
 
 await Class.findByIdAndDelete(req.params.id);
 res.json({ message: 'Class deleted successfully' });
 } catch (error) {
 res.status(500).json({ message: error.message });
 }
});

module.exports = router;
