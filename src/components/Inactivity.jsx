import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Assets from "./Assets"; // Import Assets
import "../index.css";

function Inactivity() {
  const navigate = useNavigate();
  const location = useLocation();
  const { asset, beneficiaries, term } = location.state || {};

  const [selectedTerm, setSelectedTerm] = useState(term || "inactivity");
  const [inactivityStartDate, setInactivityStartDate] = useState("");

  const handleTermChange = (event) => {
    const newTerm = event.target.value;
    setSelectedTerm(newTerm);
    switch (newTerm) {
      case "multi-sig":
        navigate("/multi-sig", { state: { asset, beneficiaries, term: newTerm } });
        break;
      case "inactivity":
        break;
      case "due-date":
        navigate("/due-date", { state: { asset, beneficiaries, term: newTerm } });
        break;
      default:
        alert("Invalid term selected.");
    }
  };

  const handleDateChange = (event) => {
    setInactivityStartDate(event.target.value);
  };

  const handleNextClick = () => {
    if (!inactivityStartDate) {
      alert("Please select a start date before proceeding.");
      return;
    }

    // Navigate to Review Plan, passing all data
    navigate("/review-plan", {
      state: {
        asset,
        beneficiaries,
        triggerConditions: `Inactivity: ${inactivityStartDate}`,
      },
    });
  };

  if (!asset || !beneficiaries) {
    return (
      <div className="inactivity-page">
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
    <div className="inactivity-page">
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

        <div className="inactivity-section">
          <h2 className="inactivity-heading">Inactivity</h2>
          <p className="inactivity-subheading">
            Set an inactivity period for your assets to be accessible.
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

          {selectedTerm === "inactivity" && (
            <>
              <label className="terms-label">Select Inactivity Start Date</label>
              <input
                type="date"
                className="form-input"
                value={inactivityStartDate}
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

export default Inactivity;