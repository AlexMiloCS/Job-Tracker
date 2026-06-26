const escapeLatex = (str) => {
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
};

const isAllUppercase = (str) => {
  const letters = str.replace(/[^a-zA-Z]/g, '');
  return letters.length > 0 && letters === letters.toUpperCase();
};

const convertDynamicJsonToLatex = (data) => {
  const basics = data.basics || {};
  const sections = data.sections || [];

  const preamble = String.raw`%-------------------------
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

  // Parse links
  const emailLink = basics.email ? `\\href{mailto:${escapeLatex(basics.email)}}{\\raisebox{-0.2\\height}\\faEnvelope\\  \\underline{${escapeLatex(basics.email)}}}` : '';
  const phoneTxt = basics.phone ? `\\raisebox{-0.1\\height}\\faPhone\\ ${escapeLatex(basics.phone)}` : '';
  const websiteLinks = (basics.links || []).map(link => {
    let icon = '\\faGlobe';
    if (link.name.toLowerCase().includes('github')) icon = '\\faGithub';
    else if (link.name.toLowerCase().includes('linkedin')) icon = '\\faLinkedin';
    const displayUrl = link.url.replace(/^https?:\/\/(www\.)?/, '');
    return `\\href{${escapeLatex(link.url)}}{\\raisebox{-0.2\\height}${icon}\\ \\underline{${escapeLatex(displayUrl)}}}`;
  });

  const contactItems = [phoneTxt, emailLink, ...websiteLinks].filter(Boolean).join(' ~ ');

  const header = String.raw`
\begin{center}
    {\Huge \scshape ${escapeLatex(basics.name || 'Your Name')}} \\ \vspace{1pt}
    ${escapeLatex(basics.location || '')} \\ \vspace{1pt}
    \small ${contactItems}
    \vspace{-8pt}
\end{center}
`;

  let body = '';

  const groupedSections = [];
  let expGroupIndex = -1;

  for (const section of sections) {
    if (!section.items || section.items.length === 0) continue;
    
    if (section.title.toLowerCase().includes('experience')) {
      if (expGroupIndex === -1) {
        groupedSections.push({
          isGroup: true,
          title: 'Experience',
          subSections: [section]
        });
        expGroupIndex = groupedSections.length - 1;
      } else {
        groupedSections[expGroupIndex].subSections.push(section);
      }
    } else {
      groupedSections.push(section);
    }
  }

  const renderDetailedItem = (item) => {
    let out = `    \\resumeSubheading\n      {${escapeLatex(item.title)}}{${escapeLatex(item.date || '')}}\n      {${escapeLatex(item.subtitle || '')}}{${escapeLatex(item.location || '')}}\n`;
    if (item.highlights && item.highlights.length > 0) {
      out += `      \\resumeItemListStart\n`;
      for (const h of item.highlights) {
        out += `        \\resumeItem{${escapeLatex(h)}}\n`;
      }
      out += `      \\resumeItemListEnd\n`;
    }
    return out;
  };

  const renderSectionBody = (section) => {
    let out = '';
    if (section.type === 'DetailedList') {
      const hasCategories = section.items.some(item => item.category);
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
            out += renderDetailedItem(item);
          }
          out += `  \\resumeSubHeadingListEnd\n`;
        }
        
        for (const [category, items] of Object.entries(categorizedItems)) {
          const parentPrinted = section.title.toLowerCase() !== 'experience';
          if (!(parentPrinted && category.toLowerCase() === section.title.toLowerCase())) {
            out += `  \\vspace{2pt}\n  \\noindent{\\large \\textbf{${escapeLatex(category)}}}\\par\n  \\vspace{-6pt}\n  \\noindent\\rule{\\textwidth}{0.4pt}\n`;
          }
          out += `  \\resumeSubHeadingListStart\n`;
          for (const item of items) {
            out += renderDetailedItem(item);
          }
          out += `  \\resumeSubHeadingListEnd\n`;
        }
        out += `\\vspace{-16pt}\n`;
      } else {
        out += `  \\resumeSubHeadingListStart\n`;
        for (const item of section.items) {
          out += renderDetailedItem(item);
        }
        out += `  \\resumeSubHeadingListEnd\n\\vspace{-16pt}\n`;
      }

    } else if (section.type === 'ProjectList') {
      out += `    \\vspace{-5pt}\n    \\resumeSubHeadingListStart\n`;
      for (const item of section.items) {
        const titleLine = item.subtitle ? `\\textbf{${escapeLatex(item.title)}} $|$ \\emph{${escapeLatex(item.subtitle)}}` : `\\textbf{${escapeLatex(item.title)}}`;
        out += `      \\resumeProjectHeading\n          {${titleLine}}{${escapeLatex(item.date || '')}}\n`;
        if (item.highlights && item.highlights.length > 0) {
          out += `          \\resumeItemListStart\n`;
          for (const h of item.highlights) {
            out += `            \\resumeItem{${escapeLatex(h)}}\n`;
          }
          out += `          \\resumeItemListEnd\n`;
        }
      }
      out += `    \\resumeSubHeadingListEnd\n\\vspace{-16pt}\n`;

    } else if (section.type === 'SimpleList') {
      out += `  \\resumeSubHeadingListStart\n`;
      for (const item of section.items) {
        out += `    \\resumeSubheading\n      {${escapeLatex(item.title)}}{${escapeLatex(item.date || '')}}\n      {${escapeLatex(item.description || '')}}{}\n`;
      }
      out += `  \\resumeSubHeadingListEnd\n\\vspace{-16pt}\n`;

    } else if (section.type === 'TagsList') {
      out += ` \\begin{itemize}[leftmargin=0.0in, label={}]\n    \\small{\\item{\n`;
      for (const item of section.items) {
        out += `     \\textbf{${escapeLatex(item.title)}}{: ${escapeLatex(item.description || '')}} \\\\\n`;
      }
      out += `    }}\n \\end{itemize}\n \\vspace{-16pt}\n`;
    }
    return out;
  };

  for (const groupOrSection of groupedSections) {
    if (groupOrSection.isGroup) {
      body += `\n%-----------${groupOrSection.title.toUpperCase()}-----------\n`;
      let titleToUse = groupOrSection.title;
      if (groupOrSection.subSections.length > 0 && isAllUppercase(groupOrSection.subSections[0].title)) {
        titleToUse = titleToUse.toUpperCase();
      }
      body += `\\section{${escapeLatex(titleToUse)}}\n`;
      for (let i = 0; i < groupOrSection.subSections.length; i++) {
        const section = groupOrSection.subSections[i];
        if (i > 0) {
          body += `  \\vspace{16pt}\n`;
        }
        if (section.title.toLowerCase() !== 'experience') {
          body += `  \\vspace{2pt}\n  \\noindent{\\large \\textbf{${escapeLatex(section.title)}}}\\par\n  \\vspace{-6pt}\n  \\noindent\\rule{\\textwidth}{0.4pt}\n`;
        }
        body += renderSectionBody(section);
      }
    } else {
      body += `\n%-----------${groupOrSection.title.toUpperCase()}-----------\n`;
      body += `\\section{${escapeLatex(groupOrSection.title)}}\n`;
      body += renderSectionBody(groupOrSection);
    }
  }

  const footer = `\n\\end{document}\n`;

  return preamble + header + body + footer;
};

export const convertJsonToLatex = (data) => {
  if (data.sections && Array.isArray(data.sections)) {
    return convertDynamicJsonToLatex(data);
  }

  const basics = data.basics || {};
  const education = data.education || [];
  const experience = data.experience || [];
  const projects = data.projects || [];
  const skills = data.skills || {};

  const preamble = String.raw`%-------------------------
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
    \begin{tabularx}{\textwidth}{X r}
      \textbf{#1} & \textbf{\small #2} \\
      \textit{\small#3} & \textit{\small #4} \\
    \end{tabularx}\vspace{-7pt}
}

\newcommand{\resumeProjectHeading}[2]{
    \item
    \begin{tabularx}{\textwidth}{X r}
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

  // Parse links
  const emailLink = basics.email ? `\\href{mailto:${escapeLatex(basics.email)}}{\\raisebox{-0.2\\height}\\faEnvelope\\  \\underline{${escapeLatex(basics.email)}}}` : '';
  const phoneTxt = basics.phone ? `\\raisebox{-0.1\\height}\\faPhone\\ ${escapeLatex(basics.phone)}` : '';
  const websiteLinks = (basics.links || []).map(link => {
    let icon = '\\faGlobe';
    if (link.name.toLowerCase().includes('github')) icon = '\\faGithub';
    else if (link.name.toLowerCase().includes('linkedin')) icon = '\\faLinkedin';
    const displayUrl = link.url.replace(/^https?:\/\/(www\.)?/, '');
    return `\\href{${escapeLatex(link.url)}}{\\raisebox{-0.2\\height}${icon}\\ \\underline{${escapeLatex(displayUrl)}}}`;
  });

  const contactItems = [phoneTxt, emailLink, ...websiteLinks].filter(Boolean).join(' ~ ');

  const header = String.raw`
\begin{center}
    {\Huge \scshape ${escapeLatex(basics.name || 'Your Name')}} \\ \vspace{1pt}
    ${escapeLatex(basics.location || '')} \\ \vspace{1pt}
    \small ${contactItems}
    \vspace{-8pt}
\end{center}
`;

  // Education
  let educationSection = '';
  if (education.length > 0) {
    const eduItems = education.map(edu => {
      const dates = `${escapeLatex(edu.startDate || '')} -- ${escapeLatex(edu.endDate || 'Present')}`;
      return `    \\resumeSubheading\n      {${escapeLatex(edu.institution)}}{${dates}}\n      {${escapeLatex(edu.degree)}}{${escapeLatex(edu.location || '')}}`;
    }).join('\n');
    educationSection = String.raw`
%-----------EDUCATION-----------
\section{Education}
  \resumeSubHeadingListStart
${eduItems}
  \resumeSubHeadingListEnd
`;
  }

  // Experience
  let experienceSection = '';
  if (experience.length > 0) {
    const expItems = experience.map(exp => {
      const dates = `${escapeLatex(exp.startDate || '')} -- ${escapeLatex(exp.endDate || 'Present')}`;
      let highlights = '';
      if (exp.highlights && exp.highlights.length > 0) {
        highlights = `\n      \\resumeItemListStart\n${exp.highlights.map(h => `        \\resumeItem{${escapeLatex(h)}}`).join('\n')}\n      \\resumeItemListEnd`;
      }
      return `    \\resumeSubheading\n      {${escapeLatex(exp.company)}}{${dates}}\n      {${escapeLatex(exp.title)}}{${escapeLatex(exp.location || '')}}${highlights}`;
    }).join('\n');
    experienceSection = String.raw`
%-----------EXPERIENCE-----------
\section{Experience}
  \resumeSubHeadingListStart
${expItems}
  \resumeSubHeadingListEnd
\vspace{-16pt}
`;
  }

  // Projects
  let projectsSection = '';
  if (projects.length > 0) {
    const projItems = projects.map(proj => {
      let highlights = '';
      if (proj.highlights && proj.highlights.length > 0) {
        highlights = `\n          \\resumeItemListStart\n${proj.highlights.map(h => `            \\resumeItem{${escapeLatex(h)}}`).join('\n')}\n          \\resumeItemListEnd`;
      }
      const titleLine = proj.technologies ? `\\textbf{${escapeLatex(proj.name)}} $|$ \\emph{${escapeLatex(proj.technologies)}}` : `\\textbf{${escapeLatex(proj.name)}}`;
      return `      \\resumeProjectHeading\n          {${titleLine}}{${escapeLatex(proj.date || '')}}${highlights}`;
    }).join('\n');
    projectsSection = String.raw`
%-----------PROJECTS-----------
\section{Projects}
    \vspace{-5pt}
    \resumeSubHeadingListStart
${projItems}
    \resumeSubHeadingListEnd
\vspace{-16pt}
`;
  }

  // Skills
  let skillsSection = '';
  const skillKeys = Object.keys(skills);
  if (skillKeys.length > 0) {
    const skillLines = skillKeys.map(key => {
      return `     \\textbf{${escapeLatex(key)}}{: ${escapeLatex(skills[key])}} \\\\`;
    }).join('\n');
    skillsSection = String.raw`
%-----------PROGRAMMING SKILLS-----------
\section{Technical Skills}
 \begin{itemize}[leftmargin=0.0in, label={}]
    \small{\item{
${skillLines}
    }}
 \end{itemize}
 \vspace{-16pt}
`;
  }

  const footer = `\n\\end{document}\n`;

  return preamble + header + educationSection + experienceSection + projectsSection + skillsSection + footer;
};
