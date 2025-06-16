import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Assets from "./Assets"; // Import Assets
import "../index.css";

function TriggerConditions() {
  const navigate = useNavigate();
  const location = useLocation();
  const { asset, beneficiaries } = location.state || {}; // Receive asset and beneficiaries
  const [selectedTerm, setSelectedTerm] = useState(""); // State to track selected term
  const [triggerTypes, setTriggerTypes] = useState([]); // State to store trigger types from API
  const [error, setError] = useState(null); // State to handle errors

  // Fetch trigger types from the API when the component mounts
  useEffect(() => {
    const fetchTriggerTypes = async () => {
      try {
        const response = await fetch("https://cip-6vcm.onrender.com/process/trigger-types");
        if (!response.ok) {
          throw new Error("Failed to fetch trigger types");
        }
        const data = await response.json();
        setTriggerTypes(data); // Expecting ["inactivity", "due-date"]
      } catch (err) {
        setError(err.message);
        console.error("Error fetching trigger types:", err);
      }
    };

    fetchTriggerTypes();
  }, []); // Empty dependency array to run once on mount

  const handleTermChange = (event) => {
    setSelectedTerm(event.target.value);
  };

  const handleNextClick = () => {
    if (!selectedTerm) {
      alert("Please select a term before proceeding.");
      return;
    }
    console.log("Navigating to:", selectedTerm); // Debug the intended navigation
    // Navigate to the appropriate page based on the selected term
    switch (selectedTerm) {
      case "inactivity":
        navigate("/inactivity", { state: { asset, beneficiaries, term: selectedTerm } });
        break;
      case "due-date":
        navigate("/due-date", { state: { asset, beneficiaries, term: selectedTerm } });
        break;
      default:
        alert("Invalid term selected.");
    }
  };

  return (
    <div className="trigger-conditions-page">
      <Assets /> {/* Preload all images */}
      {/* Sidebar (Left Frame) - Same as Dashboard */}
      <div className="sidebar">
        <div className="logo">
          <img src="../assets/images/logo-1.png" alt="CIP Logo" className="logo-image" />
        </div>
        <div className="sidebar-nav">
          <button
            className="sidebar-button dashboard-button active"
            onClick={() => navigate("/dashboard/Free")} // Adjust planName as needed
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

      {/* Main Content (Right Frame) */}
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

        {/* Step Indicator - Step 3 of 5 */}
        <div className="step-indicator">
          <span className="step active">1</span>
          <span className="step-line"></span>
          <span className="step active">2</span>
          <span className="step-line"></span>
          <span className="step active">3</span>
          <span className="step-line"></span>
          <span className="step">4</span>
          <span className="step-line"></span>
          <span className="step">5</span>
        </div>

        {/* Trigger Conditions Section */}
        <div className="trigger-conditions-section">
          <h2 className="trigger-conditions-heading">Trigger Conditions</h2>
          <p className="trigger-conditions-subheading">
            Create conditions for your assets to be accessible.
          </p>
          {error && <p className="error-message">Error: {error}</p>}
          <label className="terms-label">Select Your Terms</label>
          <select
            className="terms-dropdown"
            value={selectedTerm}
            onChange={handleTermChange}
          >
            <option value="" disabled>
              Select
            </option>
            {triggerTypes.length > 0 ? (
              triggerTypes.map((type) => (
                <option key={type} value={type}>
                  {type === "due-date"
                    ? "Due Date"
                    : type.charAt(0).toUpperCase() + type.slice(1)} {/* Format for display */}
                </option>
              ))
            ) : (
              <option value="" disabled>
                Loading trigger types...
              </option>
            )}
          </select>
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

export default TriggerConditions;