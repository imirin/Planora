const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
   const { name, email, password, role } = req.body;

   // Debug: Log incoming role
   console.log('Incoming role:', role);

   const existingUser = await User.findOne({ email });
    if (existingUser) {
     return res.status(400).json({ message: 'User already exists' });
    }

   const hashedPassword = await bcrypt.hash(password, 10);
   const user = new User({ 
     name, 
     email, 
     password: hashedPassword,
     role: role || 'student' // Use role from request or default to student
    });
    await user.save();

   // Debug: Log saved role
   console.log('Saved user role:', user.role);

   const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

   res.status(201).json({
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role 
      }
    });
  } catch (error) {
   res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
   const { email, password } = req.body;

   const user = await User.findOne({ email });
    if (!user) {
     return res.status(400).json({ message: 'Invalid credentials' });
    }

   const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
     return res.status(400).json({ message: 'Invalid credentials' });
    }

   const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

   res.json({
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role 
      }
    });
  } catch (error) {
   res.status(500).json({ message: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
   const user = await User.findById(req.userId).select('-password');
   res.json(user);
  } catch (error) {
   res.status(500).json({ message: error.message });
  }
});

module.exports = router;
