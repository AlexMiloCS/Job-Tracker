import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Job from './models/Job.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { requireAuth } from './middleware/auth.js';
import groqRoutes from './routes/groq.js';
import clusterRoutes from './routes/cluster.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Groq LLM routes
app.use('/api/groq', groqRoutes);

// Clustering routes
app.use('/api/cluster', clusterRoutes);

const FLASK_URL = process.env.FLASK_CLUSTER_URL || 'http://localhost:5001';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Successfully connected to MongoDB Atlas!');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});

// Authentication Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName, location } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      location
    });
    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      token,
      user: { id: newUser._id, email: newUser.email, firstName: newUser.firstName, lastName: newUser.lastName }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during signup' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({
      token,
      user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName, location: user.location }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

app.put('/api/auth/profile', requireAuth, async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;

    const existingUser = await User.findOne({ email, _id: { $ne: req.userId } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already in use by another account' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { firstName, lastName, email },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      id: updatedUser._id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      location: updatedUser.location
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

app.put('/api/auth/password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error updating password' });
  }
});

app.post('/api/jobs', requireAuth, async (req, res) => {
  try {
    const newJob = new Job({ ...req.body, userId: req.userId });
    await newJob.save();

    // Auto-assign cluster if Flask service is running and title exists
    if (newJob.title) {
      try {
        const flaskRes = await fetch(`${FLASK_URL}/assign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: newJob.title }),
        });
        if (flaskRes.ok) {
          const { clusterId, clusterLabel } = await flaskRes.json();
          newJob.clusterId = clusterId;
          
          // Check if the user has already renamed this cluster (manually or via AI)
          // We do this by finding any existing job with the same clusterId
          const existingJobInCluster = await Job.findOne({ 
            userId: req.userId, 
            clusterId: clusterId 
          });

          if (existingJobInCluster && existingJobInCluster.clusterLabel) {
            newJob.clusterLabel = existingJobInCluster.clusterLabel;
          } else {
            newJob.clusterLabel = clusterLabel;
          }
          
          await newJob.save();
        }
      } catch {
        // Flask not running — skip auto-assign silently
      }
    }

    res.status(201).json(newJob);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/jobs', requireAuth, async (req, res) => {
  try {
    const jobs = await Job.find({ userId: req.userId }).sort({ dateApplied: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Server Error: Could not fetch jobs' });
  }
});

app.put('/api/jobs/:id', requireAuth, async (req, res) => {
  try {
    const updatedJob = await Job.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );

    if (!updatedJob) return res.status(404).json({ error: 'Job not found or unauthorized' });
    res.status(200).json(updatedJob);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/jobs/:id', requireAuth, async (req, res) => {
  try {
    const deletedJob = await Job.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!deletedJob) return res.status(404).json({ error: 'Job not found or unauthorized' });
    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});