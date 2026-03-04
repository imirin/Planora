const express = require('express');
const Session = require('../models/Session');
const auth = require('../middleware/auth');

const router = express.Router();

// Get streak data
router.get('/streak', auth, async (req, res) => {
  try {
    // Get all sessions for user, sorted by date
    const sessions = await Session.find({ userId: req.userId }).sort({ date: 1 });
    
    if (sessions.length === 0) {
      return res.json({ currentStreak: 0, longestStreak: 0 });
    }

    // Get unique dates with sessions
    const sessionDates = new Set();
    sessions.forEach(session => {
      const dateStr = new Date(session.date).toISOString().split('T')[0];
      sessionDates.add(dateStr);
    });

    const uniqueDates = Array.from(sessionDates).sort();
    
    // Calculate current streak
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    let currentStreak = 0;
    let checkDate = today;
    
    // Check if studied today or yesterday to start streak
    if (sessionDates.has(today) || sessionDates.has(yesterday)) {
      if (sessionDates.has(today)) {
        currentStreak = 1;
      }
      
      // Count backwards
      let daysBack = sessionDates.has(today) ? 1 : 0;
      while (true) {
        const prevDate = new Date(Date.now() - (daysBack + 1) * 86400000).toISOString().split('T')[0];
        if (sessionDates.has(prevDate)) {
          currentStreak++;
          daysBack++;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let currentCount = 1;
    
    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i - 1]);
      const currDate = new Date(uniqueDates[i]);
      const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) {
        currentCount++;
      } else {
        longestStreak = Math.max(longestStreak, currentCount);
        currentCount = 1;
      }
    }
    longestStreak = Math.max(longestStreak, currentCount);

    res.json({ currentStreak, longestStreak });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get 30-day activity data
router.get('/activity', auth, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const sessions = await Session.find({
      userId: req.userId,
      date: { $gte: thirtyDaysAgo }
    });

    // Initialize all 30 days with 0
    const activityData = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      activityData[dateStr] = 0;
    }

    // Sum minutes per day
    sessions.forEach(session => {
      const dateStr = new Date(session.date).toISOString().split('T')[0];
      if (activityData[dateStr] !== undefined) {
        activityData[dateStr] += session.duration;
      }
    });

    // Convert to array
    const result = Object.entries(activityData).map(([date, minutes]) => ({
      date,
      minutes
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
