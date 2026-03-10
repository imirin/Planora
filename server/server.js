
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const subjectRoutes = require('./routes/subjects');
const topicRoutes = require('./routes/topics');
const sessionRoutes = require('./routes/sessions');
const progressRoutes = require('./routes/progress');
const classRoutes = require('./routes/classes');
const assignmentRoutes = require('./routes/assignments');
const announcementRoutes = require('./routes/announcements');
const errorHandler= require('./middleware/errorHandler');

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/announcements', announcementRoutes);

// Error handler
app.use(errorHandler);

// MongoDB connection
const dbUri = process.env.MONGODB_URI;
if (!dbUri) {
  console.error('ERROR: MONGODB_URI environment variable is not set!');
  console.error('Please check your .env file');
} else {
  // Mask password for logging
  const maskedUri = dbUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
  console.log(`Connecting to MongoDB Atlas...`);
  
  mongoose.connect(dbUri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
    .then(() => console.log('✅ MongoDB Connected successfully'))
    .catch(err => {
      console.error('❌ MongoDB Connection Error:');
      console.error('URI:', maskedUri);
      console.error('Database name should be: planora');
      console.error('Error details:', err.message);
      if (err.codeName === 'AuthenticationFailed') {
        console.error('\n⚠️  Authentication failed! Please check:');
        console.error('   1. Username is correct');
        console.error('   2. Password is correct (no special characters unescaped)');
        console.error('   3. User has read/write permissions on the database');
        console.error('   4. IP address is whitelisted in MongoDB Atlas');
      }
    });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
