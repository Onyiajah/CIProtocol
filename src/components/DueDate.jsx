import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Assets from "./Assets"; // Import Assets
import "../index.css";

function DueDate() {
  const navigate = useNavigate();
  const location = useLocation();
  const { asset, beneficiaries, term } = location.state || {};

  const [selectedTerm, setSelectedTerm] = useState(term || "due-date");
  const [dueDate, setDueDate] = useState("");

  const handleTermChange = (event) => {
    const newTerm = event.target.value;
    setSelectedTerm(newTerm);
    switch (newTerm) {
      case "multi-sig":
        navigate("/multi-sig", { state: { asset, beneficiaries, term: newTerm } });
        break;
      case "inactivity":
        navigate("/inactivity", { state: { asset, beneficiaries, term: newTerm } });
        break;
      case "due-date":
        break;
      default:
        alert("Invalid term selected.");
    }
  };

  const handleDateChange = (event) => {
    setDueDate(event.target.value);
  };

  const handleNextClick = () => {
    if (!dueDate) {
      alert("Please select a due date before proceeding.");
      return;
    }

    // Navigate to Review Plan, passing all data
    navigate("/review-plan", {
      state: {
        asset,
        beneficiaries,
        triggerConditions: `Due Date: ${dueDate}`,
      },
    });
  };

  if (!asset || !beneficiaries) {
    return (
      <div className="due-date-page">
        <div className="sidebar">
          <div className="logo">
            <img src="../assets/images/logo 1.png" alt="CIP Logo" className="logo-image" />
          </div>
          <div className="sidebar-nav">
            <button
              className="sidebar-button dashboard-button active"
              onClick={() => navigate("/dashboard/Free")}
            >
              <span className="icon houseline-icon"></span>
              Dashboard
            </button>
            <button
              className="sidebar-button plans-button"
              onClick={() => navigate("/plans")}
            >
              <span className="icon plans-icon"></span>
              Plans
            </button>
          </div>
        </div>
        <div className="main-content">
          <div className="dashboard-header">
            <h1 className="dashboard-title">Dashboard</h1>
            <div className="user-info">
              <span className="bell-icon"></span>
              <span className="user-greeting">Hello, Afolabi12345</span>
              <img
                src="../assets/images/profile.png"
                alt="User Avatar"
                className="user-avatar"
              />
              <span className="dropdown-arrow"></span>
            </div>
          </div>
          <div className="no-assets-section">
            <p className="no-assets-text">No asset or beneficiaries selected.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="due-date-page">
       <Assets /> {/* Preload all images */}
       {/* Sidebar (Left Frame) - Same as Dashboard */}
      <div className="sidebar">
        <div className="logo">
          <img src="../assets/images/logo-1.png" alt="CIP Logo" className="logo-image" />
        </div>
        <div className="sidebar-nav">
          <button
            className="sidebar-button dashboard-button active"
            onClick={() => navigate("/dashboard/Free")}
          >
            <span className="icon houseline-icon"></span>
            Dashboard
          </button>
          <button
            className="sidebar-button plans-button"
            onClick={() => navigate("/plans")}
          >
            <span className="icon plans-icon"></span>
            Plans
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Dashboard</h1>
          <div className="user-info">
            <span className="bell-icon"></span>
            <span className="user-greeting">Hello, Afolabi12345</span>
            <img
              src="../assets/images/profile.png"
              alt="User Avatar"
              className="user-avatar"
            />
            <span className="dropdown-arrow"></span>
          </div>
        </div>

        <div className="step-indicator">
          <span className="step active">1</span>
          <span className="step-line"></span>
          <span className="step active">2</span>
          <span className="step-line"></span>
          <span className="step active">3</span>
          <span className="step-line"></span>
          <span className="step active">4</span>
          <span className="step-line"></span>
          <span className="step">5</span>
        </div>

        <div className="due-date-section">
          <h2 className="due-date-heading">Due Date</h2>
          <p className="due-date-subheading">
            Set a specific date for your assets to be accessible.
          </p>

          <label className="terms-label">Select Trigger Condition</label>
          <select
            className="terms-dropdown"
            value={selectedTerm}
            onChange={handleTermChange}
          >
            <option value="" disabled>
              Select
            </option>
            <option value="multi-sig">Multi-Sig</option>
            <option value="inactivity">Inactivity</option>
            <option value="due-date">Due Date</option>
          </select>

          {selectedTerm === "due-date" && (
            <>
              <label className="terms-label">Select Due Date</label>
              <input
                type="date"
                className="form-input"
                value={dueDate}
                onChange={handleDateChange}
                min={new Date().toISOString().split("T")[0]}
              />
            </>
          )}

          <div className="next-button-wrapper">
            <button className="next-button" onClick={handleNextClick}>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DueDate; 