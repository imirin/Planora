const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Class = require('../models/Class');
const User = require('../models/User');

// Generate unique class code
const generateClassCode = async () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code;
  let exists = true;
  
  while (exists) {
    code = '';
    for (let i = 0; i < 7; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const existing = await Class.findOne({ classCode: code });
    exists = !!existing;
  }
  
  return code;
};

// Create a class (Tutor only)
router.post('/create', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'tutor') {
      return res.status(403).json({ message: 'Only tutors can create classes' });
    }

    const { title, description } = req.body;
    
    const classCode = await generateClassCode();
    
    const newClass = new Class({
      title,
      description,
      tutor: req.userId,
      classCode
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
    const classes = await Class.find({ tutor: req.userId }).populate('students', 'name email');
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get class details by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id)
      .populate('tutor', 'name email')
      .populate('students', 'name email');
    
    if (!cls) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if user is tutor of this class or a student in it
    const user = await User.findById(req.userId);
    const isTutor = cls.tutor._id.toString() === req.userId;
    const isStudent = cls.students.some(s => s._id.toString() === req.userId);

    if (!isTutor && !isStudent) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(cls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Join a class using class code (Student only)
router.post('/join', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can join classes' });
    }

    const { classCode } = req.body;
    
    const cls = await Class.findOne({ classCode: classCode.toUpperCase() });
    if (!cls) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if already joined
    if (cls.students.some(s => s.toString() === req.userId)) {
      return res.status(400).json({ message: 'Already joined this class' });
    }

    cls.students.push(req.userId);
    await cls.save();

    res.json(cls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all classes for a student
router.get('/student', auth, async (req, res) => {
  try {
    const classes = await Class.find({ students: req.userId })
      .populate('tutor', 'name email')
      .populate('students', 'name email');
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add assignment to a class (Tutor only)
router.post('/:id/assignment', auth, async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) {
      return res.status(404).json({ message: 'Class not found' });
    }

    if (cls.tutor.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only the tutor can add assignments' });
    }

    const { title, description, dueDate } = req.body;
    
    cls.assignments.push({
      title,
      description,
      dueDate
    });

    await cls.save();
    res.json(cls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get students in a class (Tutor only)
router.get('/:id/students', auth, async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id).populate('students', 'name email');
    if (!cls) {
      return res.status(404).json({ message: 'Class not found' });
    }

    if (cls.tutor.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(cls.students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a class (Tutor only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) {
      return res.status(404).json({ message: 'Class not found' });
    }

    if (cls.tutor.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Class.findByIdAndDelete(req.params.id);
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
