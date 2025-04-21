import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Assets from "./Assets"; // Import Assets
import "../index.css";

function AddAsset() {
  const navigate = useNavigate();
  const [selectedAsset, setSelectedAsset] = useState(""); // State to track selected asset

  const handleAssetChange = (event) => {
    setSelectedAsset(event.target.value);
  };

  const handleNextClick = () => {
    if (!selectedAsset) {
      alert("Please select an asset before proceeding.");
      return;
    }
    // Navigate to Add Beneficiaries and pass the selected asset
    navigate("/add-beneficiaries", { state: { asset: selectedAsset } });
  };

  return (
    <div className="add-asset-page">
      <Assets /> {/* Preload all images */}
      {/* Sidebar (Left Frame) - Same as Dashboard */}
      <div className="sidebar">
        <div className="logo">
          <img src="/assets/logo-1.png" alt="CIP Logo" className="logo-image" />
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
              src="/assets/profile.png"
              alt="User Avatar"
              className="user-avatar"
            />
            <span className="dropdown-arrow"></span>
          </div>
        </div>

        {/* Step Indicator - Step 1 of 5 */}
        <div className="step-indicator">
          <span className="step active">1</span>
          <span className="step-line"></span>
          <span className="step">2</span>
          <span className="step-line"></span>
          <span className="step">3</span>
          <span className="step-line"></span>
          <span className="step">4</span>
          <span className="step-line"></span>
          <span className="step">5</span>
        </div>

        {/* Select Your Asset Section */}
        <div className="select-asset-section">
          <h2 className="select-asset-heading">Select Your Asset</h2>
          <p className="select-asset-subheading">Choose the asset you want to add.</p>
          <label className="asset-label">Select Asset</label>
          <select
            className="asset-dropdown"
            value={selectedAsset}
            onChange={handleAssetChange}
          >
            <option value="" disabled>
              Select
            </option>
            <option value="BTC">BTC</option>
            <option value="ETH">ETH</option>
            <option value="COTI">COTI</option>
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

export default AddAsset;