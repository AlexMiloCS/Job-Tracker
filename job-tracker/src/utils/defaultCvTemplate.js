export const DEFAULT_LATEX_TEMPLATE = String.raw`%-------------------------
% Alex's CV Builder Template
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
\addtolength{\topmargin}{-.7in}
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

\newcommand{\classesList}[4]{
    \item\small{
        {#1 #2 #3 #4 \vspace{-2pt}}
  }
}

\newcommand{\resumeSubheading}[4]{
  \vspace{-2pt}\item
    \begin{tabular*}{1.0\textwidth}[t]{l@{\extracolsep{\fill}}r}
      \textbf{#1} & \textbf{\small #2} \\
      \textit{\small#3} & \textit{\small #4} \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeSubSubheading}[2]{
    \item
    \begin{tabular*}{0.97\textwidth}{l@{\extracolsep{\fill}}r}
      \textit{\small#1} & \textit{\small #2} \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeProjectHeading}[2]{
    \item
    \begin{tabular*}{1.001\textwidth}{l@{\extracolsep{\fill}}r}
      \small#1 & \textbf{\small #2}\\
    \end{tabular*}\vspace{-7pt}
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

\begin{center}
    {\Huge \scshape Alex Lastname} \\ \vspace{1pt}
    123 Developer Way, Tech City, State 12345 \\ \vspace{1pt}
    \small \raisebox{-0.1\height}\faPhone\ 123-456-7890 ~ \href{mailto:alex@example.com}{\raisebox{-0.2\height}\faEnvelope\  \underline{alex@example.com}} ~ 
    \href{https://linkedin.com/in/alex}{\raisebox{-0.2\height}\faLinkedin\ \underline{linkedin.com/in/alex}}  ~
    \href{https://github.com/alex}{\raisebox{-0.2\height}\faGithub\ \underline{github.com/alex}}
    \vspace{-8pt}
\end{center}

%-----------EDUCATION-----------
\section{Education}
  \resumeSubHeadingListStart
    \resumeSubheading
      {State University}{Sep. 2017 -- May 2021}
      {Bachelor of Science in Computer Science}{City, State}
  \resumeSubHeadingListEnd

%------RELEVANT COURSEWORK-------
\section{Relevant Coursework}
        \begin{multicols}{4}
            \begin{itemize}[itemsep=-5pt, parsep=3pt]
                \item\small Data Structures
                \item Software Methodology
                \item Algorithms Analysis
                \item Database Management
                \item Artificial Intelligence
                \item Internet Technology
                \item Systems Programming
                \item Computer Architecture
            \end{itemize}
        \end{multicols}
        \vspace*{2.0\multicolsep}

%-----------EXPERIENCE-----------
\section{Experience}
  \resumeSubHeadingListStart

    \resumeSubheading
      {Tech Company}{May 2020 -- August 2020}
      {Software Engineer Intern}{City, State}
      \resumeItemListStart
        \resumeItem{Developed a service to automatically perform a set of unit tests daily on a product in development.}
        \resumeItem{Incorporated scripts using Python and Node.js to aggregate test results into an organized format.}
      \resumeItemListEnd
  \resumeSubHeadingListEnd
\vspace{-16pt}

%-----------PROJECTS-----------
\section{Projects}
    \vspace{-5pt}
    \resumeSubHeadingListStart
      \resumeProjectHeading
          {\textbf{Job Analytics Dashboard} $|$ \emph{React, Node.js, Python}}{January 2024}
          \resumeItemListStart
            \resumeItem{Developed a full-stack application to track hiring funnels and predict job market success using ML.}
            \resumeItem{Implemented an integrated CV builder utilizing LaTeX compilation for pixel-perfect ATS-friendly resumes.}
          \resumeItemListEnd
          \vspace{-13pt}
    \resumeSubHeadingListEnd
\vspace{-15pt}

%-----------PROGRAMMING SKILLS-----------
\section{Technical Skills}
 \begin{itemize}[leftmargin=0.15in, label={}]
    \small{\item{
     \textbf{Languages}{: Python, JavaScript, TypeScript, SQL, HTML/CSS} \\
     \textbf{Technologies/Frameworks}{: React, Node.js, MongoDB, Docker, LaTeX} \\
    }}
 \end{itemize}
 \vspace{-16pt}

\end{document}
`;
