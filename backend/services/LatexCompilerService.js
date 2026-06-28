import axios from 'axios';
import FormData from 'form-data';

/**
 * LatexCompilerService — Compiles a LaTeX string into a PDF buffer
 * by sending it to the Docker-based LaTeX compiler.
 */
class LatexCompilerService {
  async compile(latexString) {
    const form = new FormData();

    const buffer = Buffer.from(latexString, 'utf-8');
    form.append('file', buffer, {
      filename: 'resume.tex',
      contentType: 'application/x-tex',
    });

    const response = await axios.post(process.env.LATEX_COMPILER_URL, form, {
      headers: {
        ...form.getHeaders(),
      },
      responseType: 'arraybuffer',
    });

    return response.data;
  }
}

export default LatexCompilerService;
