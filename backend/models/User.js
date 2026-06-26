import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String
  },
  location: {
    type: String
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  cvUrl: {
    type: String,
    default: null
  },
  generatedCvUrl: {
    type: String,
    default: null
  },
  cvData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
});

const User = mongoose.model('User', userSchema);
export default User;
