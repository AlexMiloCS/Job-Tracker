import CVService from '../services/CVService.js';
import path from 'path';

class CVController {
  constructor() {
    this.cvService = new CVService();
  }

  uploadCV = async (req, res) => {
    try {
      const result = await this.cvService.uploadCV(req.userId, req.file);
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
  };

  removeCV = async (req, res) => {
    try {
      const result = await this.cvService.removeCV(req.userId);
      res.status(200).json(result);
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Server error removing CV' });
    }
  };

  compileCV = async (req, res) => {
    try {
      const { mode, data, fileName } = req.body;
      const pdfBuffer = await this.cvService.compileCV(req.userId, mode, data, fileName);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${fileName || 'resume.pdf'}"`);
      res.send(pdfBuffer);
    } catch (error) {
      if (error.message === 'No LaTeX code provided') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || 'Server error compiling CV' });
    }
  };

  renameCV = async (req, res) => {
    try {
      const { fileName } = req.body;
      const result = await this.cvService.renameCV(req.userId, fileName);
      res.status(200).json(result);
    } catch (error) {
      if (error.message === 'No generated CV exists to rename') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || 'Server error renaming CV' });
    }
  };

  downloadCV = async (req, res) => {
    try {
      const type = req.params.type; // 'uploaded' or 'generated'
      const filePath = await this.cvService.getCVFilePath(req.userId, type);
      const isDownload = req.query.download === 'true';
      const disposition = isDownload ? 'attachment' : 'inline';

      res.sendFile(filePath, {
        headers: {
          'Content-Disposition': `${disposition}; filename="${path.basename(filePath)}"`,
        },
      });
    } catch (error) {
      if (['User not found', 'CV not found', 'File not found on server'].includes(error.message)) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Server error downloading CV' });
    }
  };

  saveCVData = async (req, res) => {
    try {
      const result = await this.cvService.saveCVData(req.userId, req.body);
      res.status(200).json(result);
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Server error saving CV data' });
    }
  };

  getCVData = async (req, res) => {
    try {
      const data = await this.cvService.getCVData(req.userId);
      res.status(200).json(data);
    } catch (error) {
      if (['User not found', 'No saved CV data found'].includes(error.message)) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Server error fetching CV data' });
    }
  };

  clearCVData = async (req, res) => {
    try {
      const result = await this.cvService.clearCVData(req.userId);
      res.status(200).json(result);
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Server error clearing CV data' });
    }
  };
}

export default CVController;
