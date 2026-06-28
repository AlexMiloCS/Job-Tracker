import { getPreamble, getHeader, getFooter } from './latexTemplates.js';
import { escapeLatex, isAllUppercase } from './latexUtils.js';
import RendererFactory from './renderers/RendererFactory.js';

/**
 * LatexResumeBuilder — Orchestrates the conversion of a JSON resume into LaTeX.
 *
 * Usage:
 *   const builder = new LatexResumeBuilder(jsonData);
 *   const latex   = builder.build();
 */
class LatexResumeBuilder {
  constructor(data) {
    this.basics = data.basics || {};
    this.sections = data.sections || [];
  }

  // ─── Public API ────────────────────────────────────────────────

  /** Assembles and returns the complete LaTeX document string. */
  build() {
    return (
      getPreamble() +
      getHeader(this.basics) +
      this._buildBody() +
      getFooter()
    );
  }

  // ─── Private: Document Structure ───────────────────────────────

  _buildBody() {
    const groupedSections = this._groupExperienceSections();
    let body = '';

    for (const groupOrSection of groupedSections) {
      if (groupOrSection._isGroup) {
        body += this._renderGroupedSection(groupOrSection);
      } else {
        body += this._renderStandaloneSection(groupOrSection);
      }
    }

    return body;
  }

  // ─── Private: Section Grouping ─────────────────────────────────

  /**
   * Groups multiple experience-related sections under one "Experience" heading,
   * while leaving all other sections standalone.
   */
  _groupExperienceSections() {
    const grouped = [];
    let expGroupIndex = -1;

    for (const section of this.sections) {
      if (!section.items || section.items.length === 0) continue;

      if (section.title.toLowerCase().includes('experience')) {
        if (expGroupIndex === -1) {
          grouped.push({
            _isGroup: true,
            title: 'Experience',
            subSections: [section],
          });
          expGroupIndex = grouped.length - 1;
        } else {
          grouped[expGroupIndex].subSections.push(section);
        }
      } else {
        grouped.push(section);
      }
    }

    return grouped;
  }

  // ─── Private: Section Rendering ────────────────────────────────

  _renderGroupedSection(group) {
    let out = `\n%-----------${group.title.toUpperCase()}-----------\n`;

    let titleToUse = group.title;
    if (group.subSections.length > 0 && isAllUppercase(group.subSections[0].title)) {
      titleToUse = titleToUse.toUpperCase();
    }
    out += `\\section{${escapeLatex(titleToUse)}}\n`;

    for (let i = 0; i < group.subSections.length; i++) {
      const section = group.subSections[i];
      if (i > 0) {
        out += `  \\vspace{16pt}\n`;
      }
      if (section.title.toLowerCase() !== 'experience') {
        out += `  \\vspace{2pt}\n  \\noindent{\\large \\textbf{${escapeLatex(section.title)}}}\\par\n  \\vspace{-6pt}\n  \\noindent\\rule{\\textwidth}{0.4pt}\n`;
      }
      out += this._renderSectionBody(section);
    }

    return out;
  }

  _renderStandaloneSection(section) {
    let out = `\n%-----------${section.title.toUpperCase()}-----------\n`;
    out += `\\section{${escapeLatex(section.title)}}\n`;
    out += this._renderSectionBody(section);
    return out;
  }

  /**
   * Dispatches rendering to the correct strategy renderer.
   */
  _renderSectionBody(section) {
    const renderer = RendererFactory.getRenderer(section.type);
    if (!renderer) return '';
    return renderer.render(section);
  }
}

export default LatexResumeBuilder;
