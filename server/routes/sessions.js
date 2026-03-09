const express = require('express');
const Session = require('../models/Session');
const auth = require('../middleware/auth');

const router = express.Router();

// Create session
router.post('/', auth, async (req, res) => {
  try {
    const { topicId, duration } = req.body;
    const session = new Session({
      userId: req.userId,
      topicId,
      duration
    });
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get today's total focus time
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sessions = await Session.find({
      userId: req.userId,
      date: { $gte: today, $lt: tomorrow }
    });

    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
    res.json({ totalMinutes, sessions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all user sessions
router.get('/', auth, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.userId }).sort({ date: -1 });
    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get weekly stats (last 7 days)
router.get('/weekly', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 6);

    const sessions = await Session.find({
      userId: req.userId,
      date: { $gte: weekAgo }
    });

    // Group by date
    const dailyStats = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dailyStats[dateStr] = 0;
    }

    sessions.forEach(session => {
      const dateStr = session.date.toISOString().split('T')[0];
      if (dailyStats[dateStr] !== undefined) {
        dailyStats[dateStr] += session.duration;
      }
    });

    const weeklyData = Object.entries(dailyStats).map(([date, minutes]) => ({
      date,
      minutes
    }));

    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);

    res.json({ weeklyData, totalMinutes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
