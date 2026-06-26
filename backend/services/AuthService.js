import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

class AuthService {
  async signup(userData) {
    const { email, password, firstName, lastName, location } = userData;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email already exists');
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
    
    return {
      token,
      user: { id: newUser._id, email: newUser.email, firstName: newUser.firstName, lastName: newUser.lastName, cvUrl: newUser.cvUrl, generatedCvUrl: newUser.generatedCvUrl }
    };
  }

  async login(credentials) {
    const { email, password } = credentials;

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    return {
      token,
      user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName, location: user.location, cvUrl: user.cvUrl, generatedCvUrl: user.generatedCvUrl }
    };
  }

  async updateProfile(userId, profileData) {
    const { firstName, lastName, email } = profileData;

    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      throw new Error('Email is already in use by another account');
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, email },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error('User not found');
    }

    return {
      id: updatedUser._id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      location: updatedUser.location,
      cvUrl: updatedUser.cvUrl,
      generatedCvUrl: updatedUser.generatedCvUrl
    };
  }

  async uploadCV(userId, file) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const cvUrl = `/uploads/${file.filename}`;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { cvUrl },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error('User not found');
    }

    return {
      id: updatedUser._id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      location: updatedUser.location,
      cvUrl: updatedUser.cvUrl,
      generatedCvUrl: updatedUser.generatedCvUrl
    };
  }

  async removeCV(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.cvUrl) {
      const filePath = path.join(process.cwd(), user.cvUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      user.cvUrl = null;
      await user.save();
    }

    return {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      cvUrl: user.cvUrl,
      generatedCvUrl: user.generatedCvUrl
    };
  }

  async compileCV(userId, latexCode) {
    if (!latexCode) {
      throw new Error('No LaTeX code provided');
    }

    try {
      const response = await fetch(`https://latexonline.cc/compile?text=${encodeURIComponent(latexCode)}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error('Failed to compile LaTeX: ' + errorText);
      }

      const buffer = await response.arrayBuffer();
      const filename = `generated-cv-${userId}-${Date.now()}.pdf`;
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
      }
      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, Buffer.from(buffer));

      const generatedCvUrl = `/uploads/${filename}`;
      
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { generatedCvUrl },
        { new: true }
      );

      if (!updatedUser) {
        throw new Error('User not found');
      }

      return {
        id: updatedUser._id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        location: updatedUser.location,
        cvUrl: updatedUser.cvUrl,
        generatedCvUrl: updatedUser.generatedCvUrl
      };
    } catch (error) {
      throw error;
    }
  }

  async updatePassword(userId, passwordData) {
    const { currentPassword, newPassword } = passwordData;

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new Error('Incorrect current password');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();
  }
}

export default AuthService;
