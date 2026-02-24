const express = require('express');
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all subjects for user
router.get('/', auth, async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.userId });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create subject
router.post('/', auth, async (req, res) => {
  try {
    const { name, colorTag } = req.body;
    const subject = new Subject({
      userId: req.userId,
      name,
      colorTag: colorTag || '#3B82F6'
    });
    await subject.save();
    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update subject
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, colorTag } = req.body;
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { name, colorTag },
      { new: true }
    );
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete subject
router.delete('/:id', auth, async (req, res) => {
  try {
    const subject = await Subject.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    // Delete all topics associated with this subject
    await Topic.deleteMany({ subjectId: req.params.id });
    res.json({ message: 'Subject deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get subject with topics
router.get('/:id/topics', auth, async (req, res) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    const topics = await Topic.find({ subjectId: req.params.id });
    res.json({ subject, topics });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
