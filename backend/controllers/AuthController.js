import AuthService from '../services/AuthService.js';
import path from 'path';

class AuthController {
  constructor() {
    this.authService = new AuthService();

    this.signup = this.signup.bind(this);
    this.login = this.login.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
    this.uploadCV = this.uploadCV.bind(this);
    this.removeCV = this.removeCV.bind(this);
    this.compileCV = this.compileCV.bind(this);
    this.renameCV = this.renameCV.bind(this);
    this.downloadCV = this.downloadCV.bind(this);
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

  async uploadCV(req, res) {
    try {
      const result = await this.authService.uploadCV(req.userId, req.file);
      res.status(200).json(result);
    } catch (error) {
      if (error.message === 'No file uploaded') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'User not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Server error uploading CV' });
    }
  }

  async removeCV(req, res) {
    try {
      const result = await this.authService.removeCV(req.userId);
      res.status(200).json(result);
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Server error removing CV' });
    }
  }

  async compileCV(req, res) {
    try {
      const { mode, data, fileName } = req.body;
      const pdfBuffer = await this.authService.compileCV(req.userId, mode, data, fileName);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${fileName || 'resume.pdf'}"`);
      res.send(pdfBuffer);
    } catch (error) {
      if (error.message === 'No LaTeX code provided') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || 'Server error compiling CV' });
    }
  }

  async renameCV(req, res) {
    try {
      const { fileName } = req.body;
      const result = await this.authService.renameCV(req.userId, fileName);
      res.status(200).json(result);
    } catch (error) {
      if (error.message === 'No generated CV exists to rename') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || 'Server error renaming CV' });
    }
  }

  async downloadCV(req, res) {
    try {
      const type = req.params.type; // 'uploaded' or 'generated'
      const filePath = await this.authService.getCVFilePath(req.userId, type);
      const isDownload = req.query.download === 'true';
      const disposition = isDownload ? 'attachment' : 'inline';
      
      res.sendFile(filePath, { 
        headers: { 
          'Content-Disposition': `${disposition}; filename="${path.basename(filePath)}"` 
        } 
      });
    } catch (error) {
      if (error.message === 'User not found' || error.message === 'CV not found' || error.message === 'File not found on server') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Server error downloading CV' });
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
