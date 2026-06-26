const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const app = express();
// Receive the file entirely in memory
const upload = multer({ storage: multer.memoryStorage() });

app.post('/compile', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const texContent = req.file.buffer.toString('utf-8');
  
  // Create an isolated, temporary directory inside the container for this specific request
  const reqId = crypto.randomUUID();
  const tempDir = path.join(os.tmpdir(), reqId);
  fs.mkdirSync(tempDir);
  
  const texFilePath = path.join(tempDir, 'resume.tex');
  const pdfFilePath = path.join(tempDir, 'resume.pdf');

  // We write the file inside the container's temporary storage (this never touches the host machine disk)
  fs.writeFileSync(texFilePath, texContent);

  // Run pdflatex
  exec(`pdflatex -interaction=nonstopmode -output-directory=${tempDir} ${texFilePath}`, (error, stdout, stderr) => {
    // pdflatex sometimes exits with a non-zero code even on success if there are warnings,
    // so the safest check is just to see if the PDF was generated.
    if (fs.existsSync(pdfFilePath)) {
      const pdfBuffer = fs.readFileSync(pdfFilePath);
      res.setHeader('Content-Type', 'application/pdf');
      res.send(pdfBuffer);
    } else {
      console.error(stdout, stderr);
      res.status(500).json({ error: 'Failed to compile LaTeX', logs: stdout });
    }

    // Instantly wipe the temporary directory containing the .tex and .pdf to protect PII
    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});

app.listen(2700, () => {
  console.log('LaTeX Compiler Service listening on port 2700');
});
