import { escapeLatex } from '../latexUtils.js';

class DetailedListRenderer {
  render(section, isGrouped = false) {
    let out = '';
    const hasCategories = section.items.some((item) => item.category);
    const esc = escapeLatex;

    if (hasCategories) {
      const categorizedItems = {};
      const uncategorizedItems = [];
      for (const item of section.items) {
        if (item.category) {
          if (!categorizedItems[item.category]) categorizedItems[item.category] = [];
          categorizedItems[item.category].push(item);
        } else {
          uncategorizedItems.push(item);
        }
      }

      if (uncategorizedItems.length > 0) {
        out += `  \\resumeSubHeadingListStart\n`;
        for (const item of uncategorizedItems) {
          out += this._renderDetailedItem(item);
        }
        out += `  \\resumeSubHeadingListEnd\n`;
      }

      for (const [category, items] of Object.entries(categorizedItems)) {
        // If the category matches the section title AND it's under a parent, we don't repeat the title.
        const parentPrinted = section.title.toLowerCase() !== 'experience';
        if (!(parentPrinted && category.toLowerCase() === section.title.toLowerCase())) {
          out += `  \\vspace{2pt}\n  \\noindent{\\large \\textbf{${esc(category)}}}\\par\n  \\vspace{-6pt}\n  \\noindent\\rule{\\textwidth}{0.4pt}\n`;
        }
        out += `  \\resumeSubHeadingListStart\n`;
        for (const item of items) {
          out += this._renderDetailedItem(item);
        }
        out += `  \\resumeSubHeadingListEnd\n`;
      }
      out += `\\vspace{-16pt}\n`;
    } else {
      out += `  \\resumeSubHeadingListStart\n`;
      for (const item of section.items) {
        out += this._renderDetailedItem(item);
      }
      out += `  \\resumeSubHeadingListEnd\n\\vspace{-16pt}\n`;
    }

    return out;
  }

  _renderDetailedItem(item) {
    const esc = escapeLatex;
    let out = `    \\resumeSubheading\n      {${esc(item.title)}}{${esc(item.date || '')}}\n      {${esc(item.subtitle || '')}}{${esc(item.location || '')}}\n`;
    if (item.highlights && item.highlights.length > 0) {
      out += `      \\resumeItemListStart\n`;
      for (const h of item.highlights) {
        out += `        \\resumeItem{${esc(h)}}\n`;
      }
      out += `      \\resumeItemListEnd\n`;
    }
    return out;
  }
}

export default DetailedListRenderer;
