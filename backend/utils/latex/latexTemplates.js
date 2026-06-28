import { escapeLatex } from './latexUtils.js';

export function getPreamble() {
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

export function getHeader(basics) {
  const esc = escapeLatex;

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

export function getFooter() {
  return `\n\\end{document}\n`;
}
