import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import plansData from "../data/plansData";
import Assets from "./Assets"; // Import Assets
import "../index.css";

function SelectPlan() {
  const { planName } = useParams();
  const navigate = useNavigate();
  const [hasRedirected, setHasRedirected] = useState(false);

  const normalizedPlanName = planName
    ? Object.keys(plansData).find(
        (key) => key.toLowerCase() === planName.toLowerCase()
      ) || null
    : null;

  if (!normalizedPlanName || !plansData[normalizedPlanName]) {
    navigate("/plans");
    return <div>Plan not found. Redirecting to Plans page...</div>;
  }

  const handleSelectPlan = (planKey) => {
    if (planKey !== normalizedPlanName) {
      navigate(`/select-plan/${planKey}`);
    }
  };

  useEffect(() => {
    if (hasRedirected) return;

    // Store the selected plan in localStorage
    localStorage.setItem("userPlan", normalizedPlanName);

    const timer = setTimeout(() => {
      setHasRedirected(true);
      // Redirect to /post-asset/:planName instead of /dashboard/:planName
      navigate(`/dashboard/${normalizedPlanName}`, { replace: true });
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate, hasRedirected, normalizedPlanName]);

  return (
    <div className="plans-container">
       <Assets /> {/* Preload all images */}
      <div className="plans-header">
        <div className="logo">
          <img src="../assets/images/logo-1.png" alt="CIP Logo" className="logo-image" />
        </div>
        <div className="user-info">
          <span className="hello-text">Hello</span>
          <span className="afolabi-text">Afolabi12345</span>
          <img
            src="../assets/images/profile.png"
            alt="User Avatar"
            className="user-avatar"
          />
          <img
            src="../assets/images/chevron-down.svg"
            alt="Dropdown Arrow"
            className="dropdown-arrow"
          />
        </div>
      </div>
      <h1>You selected the {plansData[normalizedPlanName].name}</h1>
      <div className="plans-grid">
        {Object.keys(plansData).map((planKey) => {
          const plan = plansData[planKey];
          const isSelected = planKey === normalizedPlanName;
          return (
            <div
              className={`plan-card ${isSelected ? "selected-plan" : ""}`}
              key={planKey}
            >
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
                className={`select-plan-button ${isSelected ? "selected" : ""}`}
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

export default SelectPlan; 