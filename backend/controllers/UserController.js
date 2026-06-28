import UserService from '../services/UserService.js';

class UserController {
  constructor() {
    this.userService = new UserService();
  }

  signup = async (req, res) => {
    try {
      const result = await this.userService.signup(req.body);
      res.status(201).json(result);
    } catch (error) {
      if (error.message === 'Email already exists') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Server error during signup' });
    }
  };

  login = async (req, res) => {
    try {
      const result = await this.userService.login(req.body);
      res.status(200).json(result);
    } catch (error) {
      if (error.message === 'Invalid credentials') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Server error during login' });
    }
  };

  updateProfile = async (req, res) => {
    try {
      const result = await this.userService.updateProfile(req.userId, req.body);
      res.status(200).json(result);
    } catch (error) {
      if (error.message === 'Email is already in use by another account') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'User not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Server error updating profile' });
    }
  };

  updatePassword = async (req, res) => {
    try {
      await this.userService.updatePassword(req.userId, req.body);
      res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Incorrect current password') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Server error updating password' });
    }
  };
}

export default UserController;
