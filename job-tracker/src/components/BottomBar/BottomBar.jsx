
import './Bottombar.css';
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';

function BottomBar() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bottom-bar">
      <div className="bottom-bar-left">
        <a 
          href="https://github.com/AlexMiloCS" 
          target="_blank" 
          rel="noopener noreferrer"
          aria-label="GitHub Profile"
        >
          <FaGithub className="social-icon" />
        </a>
        <a 
          href="https://www.linkedin.com/in/alexandros-milonakis-42651127a/" 
          target="_blank" 
          rel="noopener noreferrer"
          aria-label="LinkedIn Profile"
        >
          <FaLinkedin className="social-icon" />
        </a>
        <a 
          href="mailto:your.email@example.com"
          aria-label="Email Me"
        >
          <FaEnvelope className="social-icon" />
        </a>
      </div>
      
      <div className="bottom-bar-right">
        <p>&copy; {currentYear} Alexandros Milonakis. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default BottomBar;