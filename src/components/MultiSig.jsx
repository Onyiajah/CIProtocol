import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Assets from "./Assets";
import "../index.css";

function MultiSig() {
  const navigate = useNavigate();
  const location = useLocation();
  const { asset, beneficiaries, term: initialTerm } = location.state || {};
  const [selectedTerm, setSelectedTerm] = useState(initialTerm || "multi-sig");
  const [sigs, setSigs] = useState([
    { id: 1, walletAddress: "" },
    { id: 2, walletAddress: "" },
    { id: 3, walletAddress: "" },
  ]);

  const handleTermChange = (event) => {
    const newTerm = event.target.value;
    setSelectedTerm(newTerm);
    switch (newTerm) {
      case "multi-sig":
        break;
      case "inactivity":
        navigate("/inactivity", { state: { asset, beneficiaries, term: newTerm } });
        break;
      case "due-date":
        navigate("/due-date", { state: { asset, beneficiaries, term: newTerm } });
        break;
      default:
        alert("Invalid term selected.");
    }
  };

  const handleWalletAddressChange = (id, value) => {
    setSigs(
      sigs.map((sig) =>
        sig.id === id ? { ...sig, walletAddress: value } : sig
      )
    );
  };

  const handleNextClick = () => {
    const hasValidSig = sigs.some((sig) => sig.walletAddress.trim() !== "");
    if (!hasValidSig) {
      alert("Please add at least one wallet address for a sig.");
      return;
    }
    // Navigate to Review Plan, passing all data
    navigate("/review-plan", {
      state: {
        asset,
        beneficiaries,
        triggerConditions: `Multi-Sig: ${sigs
          .filter((sig) => sig.walletAddress.trim() !== "")
          .map((sig) => sig.walletAddress)
          .join(", ")}`,
      },
    });
  };

  if (!asset || !beneficiaries) {
    return (
      <div className="multi-sig-page">
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
    <div className="multi-sig-page">
      <Assets />
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

        <div className="multi-sig-section">
          <h2 className="multi-sig-heading">Multi-Sig</h2>
          <p className="multi-sig-subheading">
            Set up multi-signature requirements for your assets.
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
          {selectedTerm === "multi-sig" && (
            <div className="sigs-list">
              {sigs.map((sig) => (
                <div key={sig.id} className="sig-input">
                  <label className="sig-label">Sig {sig.id}</label>
                  <input
                    type="text"
                    className="wallet-address-input"
                    placeholder="Input wallet address"
                    value={sig.walletAddress}
                    onChange={(e) =>
                      handleWalletAddressChange(sig.id, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
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

export default MultiSig; 