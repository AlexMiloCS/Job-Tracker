import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
      user: { id: newUser._id, email: newUser.email, firstName: newUser.firstName, lastName: newUser.lastName }
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
      user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName, location: user.location }
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
      location: updatedUser.location
    };
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
