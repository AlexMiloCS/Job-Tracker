/**
 * LatexResumeBuilder — Converts a structured JSON resume into a LaTeX document.
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
      this._buildPreamble() +
      this._buildHeader() +
      this._buildBody() +
      this._buildFooter()
    );
  }

  // ─── Static Utilities ──────────────────────────────────────────

  /** Escapes LaTeX special characters in a string. */
  static escapeLatex(str) {
    if (!str) return '';
    return String(str)
      .replace(/\\/g, '\\textbackslash ')
      .replace(/&/g, '\\&')
      .replace(/%/g, '\\%')
      .replace(/\$/g, '\\$')
      .replace(/#/g, '\\#')
      .replace(/_/g, '\\_')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}')
      .replace(/~/g, '\\textasciitilde ')
      .replace(/\^/g, '\\textasciicircum ');
  }

  /** Checks if a string is entirely uppercase (ignoring non-alpha chars). */
  static isAllUppercase(str) {
    const letters = str.replace(/[^a-zA-Z]/g, '');
    return letters.length > 0 && letters === letters.toUpperCase();
  }

  // ─── Private: Document Structure ───────────────────────────────

  _buildPreamble() {
    return String.raw`%-------------------------
% CV Builder Generated LaTeX
% Adapted from Resume in Latex by Jake Gutierrez
% Based off of: https://github.com/sb2nov/resume
% License : MIT
%------------------------

\documentclass[letterpaper,11pt]{article}

\usepackage{latexsym}
\usepackage[empty]{fullpage}
\usepackage{titlesec}
\usepackage{marvosym}
\usepackage[usenames,dvipsnames]{color}
\usepackage{verbatim}
\usepackage{enumitem}
\usepackage[hidelinks]{hyperref}
\usepackage{fancyhdr}
\usepackage[english]{babel}
\usepackage{tabularx}
\usepackage{fontawesome5}
\usepackage{multicol}
\setlength{\multicolsep}{-3.0pt}
\setlength{\columnsep}{-1pt}
\input{glyphtounicode}

\pagestyle{fancy}
\fancyhf{} % clear all header and footer fields
\fancyfoot{}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}

% Adjust margins
\addtolength{\oddsidemargin}{-0.6in}
\addtolength{\evensidemargin}{-0.5in}
\addtolength{\textwidth}{1.19in}
\addtolength{\topmargin}{-0.7in}
\addtolength{\textheight}{1.4in}

\urlstyle{same}

\raggedbottom
\raggedright
\setlength{\tabcolsep}{0in}

% Sections formatting
\titleformat{\section}{
  \vspace{-4pt}\scshape\raggedright\large\bfseries
}{}{0em}{}[\color{black}\titlerule \vspace{-5pt}]

% Ensure that generate pdf is machine readable/ATS parsable
\pdfgentounicode=1

%-------------------------
% Custom commands
\newcommand{\resumeItem}[1]{
  \item\small{
    {#1 \vspace{-2pt}}
  }
}

\newcommand{\resumeSubheading}[4]{
  \vspace{-2pt}\item
    \begin{tabularx}{\textwidth}{X @{\hspace{1em}} r}
      \textbf{#1} & \textbf{\small #2} \\
      \textit{\small#3} & \textit{\small #4} \\
    \end{tabularx}\vspace{-7pt}
}

\newcommand{\resumeProjectHeading}[2]{
    \item
    \begin{tabularx}{\textwidth}{X @{\hspace{1em}} r}
      \small#1 & \textbf{\small #2}\\
    \end{tabularx}\vspace{-7pt}
}

\newcommand{\resumeSubItem}[1]{\resumeItem{#1}\vspace{-4pt}}

\renewcommand\labelitemi{$\vcenter{\hbox{\tiny$\bullet$}}$}
\renewcommand\labelitemii{$\vcenter{\hbox{\tiny$\bullet$}}$}

\newcommand{\resumeSubHeadingListStart}{\begin{itemize}[leftmargin=0.0in, label={}]}
\newcommand{\resumeSubHeadingListEnd}{\end{itemize}}
\newcommand{\resumeItemListStart}{\begin{itemize}}
\newcommand{\resumeItemListEnd}{\end{itemize}\vspace{-5pt}}

%-------------------------------------------
%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%

\begin{document}
`;
  }

  _buildHeader() {
    const esc = LatexResumeBuilder.escapeLatex;
    const basics = this.basics;

    const emailLink = basics.email
      ? `\\href{mailto:${esc(basics.email)}}{\\raisebox{-0.2\\height}\\faEnvelope\\  \\underline{${esc(basics.email)}}}`
      : '';
    const phoneTxt = basics.phone
      ? `\\raisebox{-0.1\\height}\\faPhone\\ ${esc(basics.phone)}`
      : '';

    const websiteLinks = (basics.links || []).map((link) => {
      let icon = '\\faGlobe';
      if (link.name.toLowerCase().includes('github')) icon = '\\faGithub';
      else if (link.name.toLowerCase().includes('linkedin')) icon = '\\faLinkedin';
      const displayUrl = link.url.replace(/^https?:\/\/(www\.)?/, '');
      return `\\href{${esc(link.url)}}{\\raisebox{-0.2\\height}${icon}\\ \\underline{${esc(displayUrl)}}}`;
    });

    const contactItems = [phoneTxt, emailLink, ...websiteLinks].filter(Boolean).join(' ~ ');

    return String.raw`
\begin{center}
    {\Huge \scshape ${esc(basics.name || 'Your Name')}} \\ \vspace{1pt}
    ${esc(basics.location || '')} \\ \vspace{1pt}
    \small ${contactItems}
    \vspace{-8pt}
\end{center}
`;
  }

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

  _buildFooter() {
    return `\n\\end{document}\n`;
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
    if (group.subSections.length > 0 && LatexResumeBuilder.isAllUppercase(group.subSections[0].title)) {
      titleToUse = titleToUse.toUpperCase();
    }
    out += `\\section{${LatexResumeBuilder.escapeLatex(titleToUse)}}\n`;

    for (let i = 0; i < group.subSections.length; i++) {
      const section = group.subSections[i];
      if (i > 0) {
        out += `  \\vspace{16pt}\n`;
      }
      if (section.title.toLowerCase() !== 'experience') {
        out += `  \\vspace{2pt}\n  \\noindent{\\large \\textbf{${LatexResumeBuilder.escapeLatex(section.title)}}}\\par\n  \\vspace{-6pt}\n  \\noindent\\rule{\\textwidth}{0.4pt}\n`;
      }
      out += this._renderSectionBody(section);
    }

    return out;
  }

  _renderStandaloneSection(section) {
    let out = `\n%-----------${section.title.toUpperCase()}-----------\n`;
    out += `\\section{${LatexResumeBuilder.escapeLatex(section.title)}}\n`;
    out += this._renderSectionBody(section);
    return out;
  }

  /**
   * Dispatches rendering to the correct handler based on section.type.
   */
  _renderSectionBody(section) {
    switch (section.type) {
      case 'DetailedList':
        return this._renderDetailedList(section);
      case 'ProjectList':
        return this._renderProjectList(section);
      case 'SimpleList':
        return this._renderSimpleList(section);
      case 'TagsList':
        return this._renderTagsList(section);
      default:
        return '';
    }
  }

  // ─── Private: Type-Specific Renderers ──────────────────────────

  _renderDetailedItem(item) {
    const esc = LatexResumeBuilder.escapeLatex;
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

  _renderDetailedList(section) {
    let out = '';
    const hasCategories = section.items.some((item) => item.category);
    const esc = LatexResumeBuilder.escapeLatex;

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

  _renderProjectList(section) {
    const esc = LatexResumeBuilder.escapeLatex;
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

  _renderSimpleList(section) {
    const esc = LatexResumeBuilder.escapeLatex;
    let out = `  \\resumeSubHeadingListStart\n`;

    for (const item of section.items) {
      out += `    \\resumeSubheading\n      {${esc(item.title)}}{${esc(item.date || '')}}\n      {${esc(item.description || '')}}{}\n`;
    }

    out += `  \\resumeSubHeadingListEnd\n\\vspace{-16pt}\n`;
    return out;
  }

  _renderTagsList(section) {
    const esc = LatexResumeBuilder.escapeLatex;
    let out = ` \\begin{itemize}[leftmargin=0.0in, label={}]\n    \\small{\\item{\n`;

    for (const item of section.items) {
      out += `     \\textbf{${esc(item.title)}}{: ${esc(item.description || '')}} \\\\\n`;
    }

    out += `    }}\n \\end{itemize}\n \\vspace{-16pt}\n`;
    return out;
  }
}

export default LatexResumeBuilder;
