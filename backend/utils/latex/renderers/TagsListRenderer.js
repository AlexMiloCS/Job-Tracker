import { escapeLatex } from '../latexUtils.js';

class TagsListRenderer {
  render(section) {
    const esc = escapeLatex;
    let out = ` \\begin{itemize}[leftmargin=0.0in, label={}]\n    \\small{\\item{\n`;

    for (const item of section.items) {
      out += `     \\textbf{${esc(item.title)}}{: ${esc(item.description || '')}} \\\\\n`;
    }

    out += `    }}\n \\end{itemize}\n \\vspace{-16pt}\n`;
    return out;
  }
}

export default TagsListRenderer;
