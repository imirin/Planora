const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Class = require('../models/Class');
const User = require('../models/User');
const Session = require('../models/Session');

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

// ─── STATIC ROUTES FIRST (before /:id) ─────────────────────────────────────

// Create a class (Tutor only)
router.post('/create', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'tutor') {
      return res.status(403).json({ message: 'Only tutors can create classes' });
    }
    const { title, description } = req.body;
    const classCode = await generateClassCode();
    const newClass = new Class({ title, description, tutor: req.userId, classCode });
    await newClass.save();
    res.status(201).json(newClass);
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
    if (!cls) return res.status(404).json({ message: 'Class not found' });
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

// Get all classes for a tutor
router.get('/tutor', auth, async (req, res) => {
  try {
    const classes = await Class.find({ tutor: req.userId }).populate('students', 'name email');
    res.json(classes);
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

// Tutor dashboard stats
router.get('/tutor/stats', auth, async (req, res) => {
  try {
    const classes = await Class.find({ tutor: req.userId }).populate('students', 'name email');
    const totalClasses = classes.length;

    // Unique students
    const studentIdSet = new Set();
    classes.forEach(cls => cls.students.forEach(s => studentIdSet.add(s._id.toString())));
    const totalStudents = studentIdSet.size;
    const studentIds = Array.from(studentIdSet);

    // Total study time across all students
    const sessions = studentIds.length
      ? await Session.find({ userId: { $in: studentIds } })
      : [];
    const totalStudyTime = sessions.reduce((sum, s) => sum + s.duration, 0);

    // Active assignments (due in the future)
    let activeAssignments = 0;
    classes.forEach(cls => {
      cls.assignments.forEach(a => {
        if (a.dueDate && new Date(a.dueDate) >= new Date()) activeAssignments++;
      });
    });

    // Recent activity: last joined students
    const recentActivity = classes
      .flatMap(cls =>
        cls.students.map(student => ({
          studentName: student.name,
          className: cls.title,
          classId: cls._id,
          joinedAt: cls.updatedAt
        }))
      )
      .sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt))
      .slice(0, 8);

    // Top performer by total study time
    let topPerformer = null;
    if (studentIds.length > 0) {
      const timeMap = {};
      sessions.forEach(s => {
        const uid = s.userId.toString();
        timeMap[uid] = (timeMap[uid] || 0) + s.duration;
      });
      const sorted = Object.entries(timeMap).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 0) {
        const [topId, topTime] = sorted[0];
        const topStudent = classes
          .flatMap(c => c.students)
          .find(s => s._id.toString() === topId);
        if (topStudent) topPerformer = { name: topStudent.name, totalTime: topTime };
      }
    }

    res.json({ totalClasses, totalStudents, totalStudyTime, activeAssignments, recentActivity, topPerformer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// All unique students across tutor's classes
router.get('/tutor/students', auth, async (req, res) => {
  try {
    const classes = await Class.find({ tutor: req.userId }).populate('students', 'name email');
    const studentMap = new Map();
    classes.forEach(cls => {
      cls.students.forEach(student => {
        const sid = student._id.toString();
        if (!studentMap.has(sid)) {
          studentMap.set(sid, { _id: student._id, name: student.name, email: student.email, classes: [], totalTime: 0 });
        }
        studentMap.get(sid).classes.push({ _id: cls._id, title: cls.title });
      });
    });

    const studentArr = Array.from(studentMap.values());
    const ids = studentArr.map(s => s._id);
    const sessions = ids.length ? await Session.find({ userId: { $in: ids } }) : [];

    const result = studentArr.map(student => {
      const totalTime = sessions
        .filter(s => s.userId.toString() === student._id.toString())
        .reduce((sum, s) => sum + s.duration, 0);
      return { ...student, classCount: student.classes.length, totalTime };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── PARAMETRIC ROUTES (/:id) ─────────────────────────────────────────────

// Get class details by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id)
      .populate('tutor', 'name email')
      .populate('students', 'name email')
      .populate('assignments.submissions.student', 'name email');
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    const isTutor = cls.tutor._id.toString() === req.userId;
    const isStudent = cls.students.some(s => s._id.toString() === req.userId);
    if (!isTutor && !isStudent) return res.status(403).json({ message: 'Access denied' });
    res.json(cls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get students in a class
router.get('/:id/students', auth, async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id).populate('students', 'name email');
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    if (cls.tutor.toString() !== req.userId) return res.status(403).json({ message: 'Access denied' });
    res.json(cls.students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ASSIGNMENTS ────────────────────────────────────────────────────────────

// Get assignments for a class
router.get('/:id/assignments', auth, async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id).populate('assignments.submissions.student', 'name email');
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    res.json(cls.assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add assignment to a class (Tutor only)
router.post('/:id/assignment', auth, async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    if (cls.tutor.toString() !== req.userId) return res.status(403).json({ message: 'Only the tutor can add assignments' });
    const { title, description, dueDate } = req.body;
    cls.assignments.push({ title, description, dueDate });
    await cls.save();
    res.json(cls.assignments[cls.assignments.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete an assignment (Tutor only)
router.delete('/:id/assignments/:assignmentId', auth, async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    if (cls.tutor.toString() !== req.userId) return res.status(403).json({ message: 'Access denied' });
    cls.assignments = cls.assignments.filter(a => a._id.toString() !== req.params.assignmentId);
    await cls.save();
    res.json({ message: 'Assignment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit assignment (Student only)
router.post('/:id/assignments/:assignmentId/submit', auth, async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    const assignment = cls.assignments.id(req.params.assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    const { content } = req.body;
    const existing = assignment.submissions.find(s => s.student.toString() === req.userId);
    if (existing) {
      existing.content = content;
      existing.submittedAt = new Date();
    } else {
      assignment.submissions.push({ student: req.userId, content });
    }
    await cls.save();
    res.json({ message: 'Submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get submissions for an assignment (Tutor only)
router.get('/:id/assignments/:assignmentId/submissions', auth, async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id).populate('assignments.submissions.student', 'name email');
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    if (cls.tutor.toString() !== req.userId) return res.status(403).json({ message: 'Access denied' });
    const assignment = cls.assignments.id(req.params.assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    res.json(assignment.submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ANNOUNCEMENTS ─────────────────────────────────────────────────────────

// Get announcements for a class
router.get('/:id/announcements', auth, async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    res.json([...cls.announcements].reverse());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create announcement (Tutor only)
router.post('/:id/announcements', auth, async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    if (cls.tutor.toString() !== req.userId) return res.status(403).json({ message: 'Access denied' });
    const { message } = req.body;
    cls.announcements.push({ message });
    await cls.save();
    res.status(201).json(cls.announcements[cls.announcements.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete announcement (Tutor only)
router.delete('/:id/announcements/:announcementId', auth, async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    if (cls.tutor.toString() !== req.userId) return res.status(403).json({ message: 'Access denied' });
    cls.announcements = cls.announcements.filter(a => a._id.toString() !== req.params.announcementId);
    await cls.save();
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── LEADERBOARD ────────────────────────────────────────────────────────────

// Get leaderboard for a class
router.get('/:id/leaderboard', auth, async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id).populate('students', 'name email');
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    const isTutor = cls.tutor.toString() === req.userId;
    const isStudent = cls.students.some(s => s._id.toString() === req.userId);
    if (!isTutor && !isStudent) return res.status(403).json({ message: 'Access denied' });

    const leaderboard = await Promise.all(
      cls.students.map(async (student) => {
        const sessions = await Session.find({ userId: student._id });
        const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0);
        return { student: { _id: student._id, name: student.name, email: student.email }, totalTime, sessionsCount: sessions.length };
      })
    );
    leaderboard.sort((a, b) => b.totalTime - a.totalTime);
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── DELETE ────────────────────────────────────────────────────────────────

// Delete a class (Tutor only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    if (cls.tutor.toString() !== req.userId) return res.status(403).json({ message: 'Access denied' });
    await Class.findByIdAndDelete(req.params.id);
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
