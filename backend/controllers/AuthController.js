import AuthService from '../services/AuthService.js';

class AuthController {
  constructor() {
    this.authService = new AuthService();

    this.signup = this.signup.bind(this);
    this.login = this.login.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
  }

  async signup(req, res) {
    try {
      const result = await this.authService.signup(req.body);
      res.status(201).json(result);
    } catch (error) {
      if (error.message === 'Email already exists') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Server error during signup' });
    }
  }

  async login(req, res) {
    try {
      const result = await this.authService.login(req.body);
      res.status(200).json(result);
    } catch (error) {
      if (error.message === 'Invalid credentials') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Server error during login' });
    }
  }

  async updateProfile(req, res) {
    try {
      const result = await this.authService.updateProfile(req.userId, req.body);
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
  }

  async updatePassword(req, res) {
    try {
      await this.authService.updatePassword(req.userId, req.body);
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
  }
}

export default AuthController;
