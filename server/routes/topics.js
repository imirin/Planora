const express = require('express');
const Topic = require('../models/Topic');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all topics for user (with optional subject filter)
router.get('/', auth, async (req, res) => {
  try {
    const { subjectId, priority, status } = req.query;
    const filter = { userId: req.userId };
    
    if (subjectId) filter.subjectId = subjectId;
    if (priority) filter.priority = priority;
    if (status) filter.status = status;

    const topics = await Topic.find(filter).sort({ createdAt: -1 });
    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create topic
router.post('/', auth, async (req, res) => {
  try {
    const { subjectId, title, deadline, priority, status, estimatedTime, notes } = req.body;
    const topic = new Topic({
      userId: req.userId,
      subjectId,
      title,
      deadline,
      priority: priority || 'Medium',
      status: status || 'Not Started',
      estimatedTime: estimatedTime || 0,
      notes: notes || ''
    });
    await topic.save();
    res.status(201).json(topic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update topic
router.put('/:id', auth, async (req, res) => {
  try {
    const updates = req.body;
    const topic = await Topic.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updates,
      { new: true }
    );
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    res.json(topic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete topic
router.delete('/:id', auth, async (req, res) => {
  try {
    const topic = await Topic.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    res.json({ message: 'Topic deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
