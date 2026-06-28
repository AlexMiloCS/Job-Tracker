import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

class UserService {
  /**
   * Maps a Mongoose User document to a safe DTO for API responses.
   * Centralises the user shape in one place to avoid duplication.
   */
  _toUserDTO(user) {
    return {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      cvUrl: user.cvUrl,
      generatedCvUrl: user.generatedCvUrl,
    };
  }

  /** Generates a signed JWT for the given userId. */
  _generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  }

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
      location,
    });
    await newUser.save();

    return {
      token: this._generateToken(newUser._id),
      user: this._toUserDTO(newUser),
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

    return {
      token: this._generateToken(user._id),
      user: this._toUserDTO(user),
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

    return this._toUserDTO(updatedUser);
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
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
  }
}

export default UserService;
