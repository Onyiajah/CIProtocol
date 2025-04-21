import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Assets from "./Assets"; // Import Assets
import "../index.css";

function AddBeneficiaries() {
  const navigate = useNavigate();
  const location = useLocation();
  const { asset } = location.state || {}; // Receive the asset from AddAsset
  const [beneficiaries, setBeneficiaries] = useState([
    { id: 1, walletAddress: "" },
    { id: 2, walletAddress: "" },
  ]); // State to track beneficiaries

  const handleAddBeneficiary = () => {
    setBeneficiaries([...beneficiaries, { id: beneficiaries.length + 2, walletAddress: "" }]);
  };

  const handleWalletAddressChange = (id, value) => {
    setBeneficiaries(
      beneficiaries.map((beneficiary) =>
        beneficiary.id === id ? { ...beneficiary, walletAddress: value } : beneficiary
      )
    );
  };

  const handleNextClick = () => {
    // Validate that at least one beneficiary has a wallet address
    const hasValidBeneficiary = beneficiaries.some(
      (beneficiary) => beneficiary.walletAddress.trim() !== ""
    );
    if (!hasValidBeneficiary) {
      alert("Please add at least one beneficiary with a valid wallet address.");
      return;
    }
    // Navigate to Trigger Conditions and pass the asset and beneficiaries
    navigate("/trigger-conditions", { state: { asset, beneficiaries } });
  };

  return (
    <div className="add-beneficiaries-page">
      <Assets /> {/* Preload all images */}
      {/* Sidebar (Left Frame) - Same as Dashboard */}
      <div className="sidebar">
        <<div className="logo">
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

        {/* Step Indicator - Step 2 of 5 */}
        <div className="step-indicator">
          <span className="step">1</span>
          <span className="step-line"></span>
          <span className="step active">2</span>
          <span className="step-line"></span>
          <span className="step">3</span>
          <span className="step-line"></span>
          <span className="step">4</span>
          <span className="step-line"></span>
          <span className="step">5</span>
        </div>

        {/* Add Beneficiaries Section */}
        <div className="add-beneficiaries-section">
          <h2 className="add-beneficiaries-heading">Let’s Add Beneficiaries</h2>
          <p className="add-beneficiaries-subheading">Add one or more beneficiaries.</p>
          <div className="beneficiaries-list">
            {beneficiaries.map((beneficiary) => (
              <div key={beneficiary.id} className="beneficiary-input">
                <label className="beneficiary-label">
                  Beneficiary {beneficiary.id}
                </label>
                <input
                  type="text"
                  className="wallet-address-input"
                  placeholder="Input wallet address"
                  value={beneficiary.walletAddress}
                  onChange={(e) =>
                    handleWalletAddressChange(beneficiary.id, e.target.value)
                  }
                />
              </div>
            ))}
          </div>
          <div className="button-container">
            <button
              className="add-beneficiary-button"
              onClick={handleAddBeneficiary}
            >
              <span className="add-beneficiary-icon"></span> {/* Added span for the plus icon */}
              Add Beneficiary
            </button>
            <div className="next-button-wrapper">
              <button className="next-button" onClick={handleNextClick}>
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddBeneficiaries;
