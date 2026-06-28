import { escapeLatex } from '../latexUtils.js';

class ProjectListRenderer {
  render(section) {
    const esc = escapeLatex;
    let out = `    \\vspace{-5pt}\n    \\resumeSubHeadingListStart\n`;

    for (const item of section.items) {
      const titleLine = item.subtitle
        ? `\\textbf{${esc(item.title)}} $|$ \\emph{${esc(item.subtitle)}}`
        : `\\textbf{${esc(item.title)}}`;
      out += `      \\resumeProjectHeading\n          {${titleLine}}{${esc(item.date || '')}}\n`;
      if (item.highlights && item.highlights.length > 0) {
        out += `          \\resumeItemListStart\n`;
        for (const h of item.highlights) {
          out += `            \\resumeItem{${esc(h)}}\n`;
        }
        out += `          \\resumeItemListEnd\n`;
      }
    }

    out += `    \\resumeSubHeadingListEnd\n\\vspace{-16pt}\n`;
    return out;
  }
}

export default ProjectListRenderer;
