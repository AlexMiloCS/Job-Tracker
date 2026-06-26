import axios from 'axios';
import FormData from 'form-data';

export const compileLatexToPDF = async (latexString) => {
  const form = new FormData();
  
  // Convert string to Buffer and append as file
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
};
