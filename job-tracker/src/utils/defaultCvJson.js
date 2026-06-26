export const DEFAULT_JSON_TEMPLATE = JSON.stringify(
  {
    "basics": {
      "name": "Alex Lastname",
      "email": "alex@example.com",
      "phone": "123-456-7890",
      "location": "City, State",
      "links": [
        {
          "name": "LinkedIn",
          "url": "https://linkedin.com/in/alex"
        },
        {
          "name": "GitHub",
          "url": "https://github.com/alex"
        }
      ]
    },
    "education": [
      {
        "institution": "State University",
        "degree": "Bachelor of Science in Computer Science",
        "location": "City, State",
        "startDate": "Sep. 2017",
        "endDate": "May 2021"
      }
    ],
    "experience": [
      {
        "company": "Tech Company",
        "title": "Software Engineer Intern",
        "location": "City, State",
        "startDate": "May 2020",
        "endDate": "August 2020",
        "highlights": [
          "Developed a service to automatically perform a set of unit tests daily on a product in development.",
          "Incorporated scripts using Python and Node.js to aggregate test results into an organized format."
        ]
      }
    ],
    "projects": [
      {
        "name": "Job Analytics Dashboard",
        "technologies": "React, Node.js, Python",
        "date": "January 2024",
        "highlights": [
          "Developed a full-stack application to track hiring funnels and predict job market success using ML.",
          "Implemented an integrated CV builder utilizing LaTeX compilation for pixel-perfect ATS-friendly resumes."
        ]
      }
    ],
    "skills": {
      "Languages": "Python, JavaScript, TypeScript, SQL, HTML/CSS",
      "Technologies/Frameworks": "React, Node.js, MongoDB, Docker, LaTeX"
    }
  },
  null,
  2
);
