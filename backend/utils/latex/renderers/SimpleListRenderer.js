import { escapeLatex } from '../latexUtils.js';

class SimpleListRenderer {
  render(section) {
    const esc = escapeLatex;
    let out = `  \\resumeSubHeadingListStart\n`;

    for (const item of section.items) {
      out += `    \\resumeSubheading\n      {${esc(item.title)}}{${esc(item.date || '')}}\n      {${esc(item.description || '')}}{}\n`;
    }

    out += `  \\resumeSubHeadingListEnd\n\\vspace{-16pt}\n`;
    return out;
  }
}

export default SimpleListRenderer;
