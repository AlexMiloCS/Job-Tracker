import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { convertJsonToLatex } from '../utils/jsonToLatex.js';

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

  async compileCV(userId, mode, data, fileName) {
    let latexCode = data;
    
    if (mode === 'json') {
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid JSON data provided');
      }
      latexCode = convertJsonToLatex(data);
    } else if (!latexCode) {
      throw new Error('No LaTeX code provided');
    }

    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const fd = new FormData();
      fd.append('filecontents[]', latexCode);
      fd.append('filename[]', 'document.tex');
      fd.append('engine', 'pdflatex');
      fd.append('return', 'pdf');

      const response = await fetch('https://texlive.net/cgi-bin/latexcgi', {
        method: 'POST',
        body: fd
      });

      if (!response.ok) {
        throw new Error(`Failed to compile LaTeX: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/plain')) {
        const errorText = await response.text();
        throw new Error('LaTeX Compilation Error:\n' + errorText);
      }

      const buffer = await response.arrayBuffer();
      
      const safeFilename = fileName 
        ? fileName.replace(/[^a-zA-Z0-9_\-\.]/g, '_') 
        : `Resume`;
      const finalFilename = safeFilename.endsWith('.pdf') ? safeFilename : `${safeFilename}.pdf`;

      const uploadDir = path.join(process.cwd(), 'uploads', userId.toString());
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const filePath = path.join(uploadDir, finalFilename);
      fs.writeFileSync(filePath, Buffer.from(buffer));

      if (user.generatedCvUrl) {
        const oldFilePath = path.join(process.cwd(), user.generatedCvUrl);
        if (fs.existsSync(oldFilePath) && oldFilePath !== filePath) {
          fs.unlinkSync(oldFilePath);
        }
      }

      const generatedCvUrl = `/uploads/${userId}/${finalFilename}`;
      user.generatedCvUrl = generatedCvUrl;
      const updatedUser = await user.save();

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

  async renameCV(userId, newFileName) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    if (!user.generatedCvUrl) throw new Error('No generated CV exists to rename');

    const safeFilename = newFileName 
      ? newFileName.replace(/[^a-zA-Z0-9_\-\.]/g, '_') 
      : `Resume`;
    const finalFilename = safeFilename.endsWith('.pdf') ? safeFilename : `${safeFilename}.pdf`;

    const oldFilePath = path.join(process.cwd(), user.generatedCvUrl);
    const uploadDir = path.join(process.cwd(), 'uploads', userId.toString());
    const newFilePath = path.join(uploadDir, finalFilename);

    if (fs.existsSync(oldFilePath)) {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      fs.renameSync(oldFilePath, newFilePath);
    }

    const generatedCvUrl = `/uploads/${userId}/${finalFilename}`;
    user.generatedCvUrl = generatedCvUrl;
    await user.save();

    return { generatedCvUrl };
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
