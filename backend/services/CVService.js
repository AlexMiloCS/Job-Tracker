import User from '../models/User.js';
import fs from 'fs';
import path from 'path';
import LatexResumeBuilder from '../utils/latex/LatexResumeBuilder.js';
import LatexCompilerService from './LatexCompilerService.js';

class CVService {
  constructor() {
    this.latexCompiler = new LatexCompilerService();
  }

  // ─── Private Helpers ───────────────────────────────────────────

  /** Fetches a user by ID or throws a standard error. */
  async _findUserOrThrow(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  /** Returns the absolute path to a user's upload directory, creating it if needed. */
  _ensureUploadDir(userId) {
    const dir = path.join(process.cwd(), 'uploads', userId.toString());
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  /** Sanitises a user-provided filename into a safe .pdf name. */
  _sanitizeFilename(name) {
    const safe = name
      ? name.replace(/[^a-zA-Z0-9_\-\.]/g, '_')
      : 'Resume';
    return safe.endsWith('.pdf') ? safe : `${safe}.pdf`;
  }

  /** Maps a user document to the public DTO (mirrors UserService._toUserDTO). */
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

  // ─── Uploaded CV Operations ────────────────────────────────────

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

    return this._toUserDTO(updatedUser);
  }

  async removeCV(userId) {
    const user = await this._findUserOrThrow(userId);

    if (user.cvUrl) {
      const filePath = path.join(process.cwd(), user.cvUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      user.cvUrl = null;
      await user.save();
    }

    return this._toUserDTO(user);
  }

  // ─── Generated CV Operations ───────────────────────────────────

  async compileCV(userId, mode, data, fileName) {
    let latexCode = data;

    if (mode === 'json') {
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid JSON data provided');
      }
      const builder = new LatexResumeBuilder(data);
      latexCode = builder.build();
    } else if (!latexCode) {
      throw new Error('No LaTeX code provided');
    }

    const user = await this._findUserOrThrow(userId);
    const pdfBuffer = await this.latexCompiler.compile(latexCode);

    const finalFilename = this._sanitizeFilename(fileName);
    const uploadDir = this._ensureUploadDir(userId);
    const filePath = path.join(uploadDir, finalFilename);
    fs.writeFileSync(filePath, pdfBuffer);

    user.generatedCvUrl = `/uploads/${userId}/${finalFilename}`;
    await user.save();

    return pdfBuffer;
  }

  async renameCV(userId, newFileName) {
    const user = await this._findUserOrThrow(userId);
    if (!user.generatedCvUrl) {
      throw new Error('No generated CV exists to rename');
    }

    const finalFilename = this._sanitizeFilename(newFileName);
    const oldFilePath = path.join(process.cwd(), user.generatedCvUrl);
    const uploadDir = this._ensureUploadDir(userId);
    const newFilePath = path.join(uploadDir, finalFilename);

    if (fs.existsSync(oldFilePath)) {
      fs.renameSync(oldFilePath, newFilePath);
    }

    user.generatedCvUrl = `/uploads/${userId}/${finalFilename}`;
    await user.save();

    return { generatedCvUrl: user.generatedCvUrl };
  }

  async getCVFilePath(userId, type) {
    const user = await this._findUserOrThrow(userId);

    const fileUrl = type === 'generated' ? user.generatedCvUrl : user.cvUrl;
    if (!fileUrl) {
      throw new Error('CV not found');
    }

    const filePath = path.join(process.cwd(), fileUrl);
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found on server');
    }

    return filePath;
  }

  // ─── CV Data (Builder JSON) Persistence ────────────────────────

  async saveCVData(userId, cvData) {
    const user = await this._findUserOrThrow(userId);
    user.cvData = cvData;
    await user.save();
    return { message: 'CV data saved successfully' };
  }

  async getCVData(userId) {
    const user = await this._findUserOrThrow(userId);
    if (!user.cvData) {
      throw new Error('No saved CV data found');
    }
    return user.cvData;
  }

  async clearCVData(userId) {
    const user = await this._findUserOrThrow(userId);
    user.cvData = null;
    await user.save();
    return { message: 'CV data cleared successfully' };
  }
}

export default CVService;
