import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import groqRoutes from './routes/groq.js';
import clusterRoutes from './routes/cluster.js';
import userRoutes from './routes/user.js';
import cvRoutes from './routes/cv.js';
import jobRoutes from './routes/jobs.js';
import analyticsRoutes from './routes/analytics.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/groq', groqRoutes);
app.use('/api/cluster', clusterRoutes);
app.use('/api/auth', userRoutes);   // signup, login, profile, password
app.use('/api/auth', cvRoutes);     // CV upload, compile, data, etc.
app.use('/api/jobs', jobRoutes);
app.use('/api/analytics', analyticsRoutes);

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