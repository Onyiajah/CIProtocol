import React from "react";
import { useNavigate } from "react-router-dom";
import plansData from "../data/plansData"; // Updated import path
import Assets from "./Assets"; // Import Assets
import "../index.css";

function Plans() {
  const navigate = useNavigate();

  const handleSelectPlan = (plan) => {
    navigate(`/select-plan/${plan}`);
  };

  return (
    <div className="plans-container">
       <Assets /> {/* Preload all images */}
      <div className="plans-header">
        <div className="logo">
            <img src="/assets/logo-1.png" alt="CIP Logo" className="logo-image" />
          </div>
        <div className="user-info">
          <span className="hello-text">Hello</span>
          <span className="afolabi-text">Afolabi12345</span>
          <img
            src="/assets/profile.png"
            alt="Profile"
            className="user-avatar"
          />
          <img
            src="/assets/dropdown.png"
            alt="Dropdown Arrow"
            className="dropdown-arrow"
          />
        </div>
      </div>
      <h1>Choose the Best Plan For You!</h1>
      <div className="plans-grid">
        {Object.keys(plansData).map((planKey) => {
          const plan = plansData[planKey];
          return (
            <div className="plan-card" key={planKey}>
              <div className="plan-name-container">
                <h3>{plan.name}</h3>
              </div>
              <div className="price-billing-container">
                {plan.billing ? (
                  <>
                    <p className="price">
                      {plan.price}{" "}
                      {plan.payment && <span>{plan.payment}</span>}
                    </p>
                    <p className="billing">{plan.billing}</p>
                  </>
                ) : (
                  <p className="price">{plan.price}</p>
                )}
              </div>
              <div className="dotted-line"></div>
              <ul className="features-list">
                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    className={feature.available ? "feature-available" : "feature-unavailable"}
                  >
                    {feature.name}
                  </li>
                ))}
              </ul>
              <button
                className="select-plan-button"
                onClick={() => handleSelectPlan(planKey)}
              >
                Select Plan
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Plans; 
