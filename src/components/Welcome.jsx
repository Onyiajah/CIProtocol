import React from "react"; // Remove useState since it's no longer needed
import { useNavigate } from "react-router-dom";
import Assets from "./Assets"; // Import Assets
import "../index.css";

function Welcome() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/signup");
  };

  const handleSkipTutorial = () => {
    alert("Tutorial skipped!");
    navigate("/signup");
  };

  return (
    <div className="welcome-container">
        <Assets /> {/* Preload all images */}
      <div className="welcome-left">
        <div className="welcome-left-content">
          <h1>Welcome to Crypto Inheritance Protocol.</h1>
          <p>Let's get you started on securing your legacy!</p>
        </div>
      </div>
      <div className="welcome-right">
        <div className="welcome-right-content">
          <div className="logo">
            <img src="/assets/logo-1.png" alt="CIP Logo" className="logo-image" />
          </div>
          <div className="tutorial">
            <h3>WATCH TUTORIAL</h3>
            <p>Take a brief tour on how things work with us.</p>
            <div className="video-placeholder">
              <svg className="play-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="12" fill="rgba(0, 0, 0, 0.5)" />
                <path d="M9 6.6v10.8L16.2 12L9 6.6z" fill="white" />
              </svg>
            </div>
          </div>
          <button className="get-started" onClick={handleGetStarted}>
            Get Started
          </button>
          <button className="skip-tutorial" onClick={handleSkipTutorial}>
            Skip Tutorial
          </button>
        </div>
      </div>
    </div>
  );
}

export default Welcome; 
