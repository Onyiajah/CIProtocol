import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Assets from "./Assets"; // Import Assets
import "../index.css";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleResetPassword = (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user"));

    if (user && user.email === email) {
      setMessage("Password reset link sent to your email.");
    } else {
      setMessage("Email not found.");
    }
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
          <div className="progress-indicator">
            <span className="progress-step active">1</span>
            <span className="progress-line"></span>
            <span className="progress-step active">2</span>
            <span className="progress-line"></span>
            <span className="progress-step">3</span>
          </div>
          <div className="form-section">
            <div className="signup-header">
              <h3>FORGOT PASSWORD</h3>
              <p>Enter your email to reset your password</p>
            </div>
            <div className="form-fields">
              <form onSubmit={handleResetPassword}>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {message && (
                  <p className={message.includes("not found") ? "form-error" : "success-message"}>
                    {message}
                  </p>
                )}
                <div className="form-buttons">
                  <button type="submit" className="reset-password-button">
                    Send Reset Link
                  </button>
                  <button
                    type="button"
                    className="back-to-login"
                    onClick={() => navigate("/login")}
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;