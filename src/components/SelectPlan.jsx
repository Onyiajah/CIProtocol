import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Assets from "./Assets";
import "../index.css";
import images from '../assets/images';

const { walletLogos, uiIcons } = images;
const { cipLogo } = walletLogos;
const { profile, dropdown } = uiIcons;

// Define feature mappings based on API fields
const featureFields = [
  { key: "legal_executirs", name: "Legal Executors" },
  { key: "create_inherent_plans", name: "Create Inherent Plans" },
  { key: "encrypted_document_storage", name: "Encrypted Document Storage" },
  { key: "ai_powered_plan_creation", name: "AI-Powered Plan Creation" },
  { key: "individual_users", name: "Individual Users" },
  { key: "crypto_investors", name: "Crypto Investors" },
  { key: "institutions", name: "Institutions" },
  { key: "multi_signature_wallet", name: "Multi-Signature Wallet" },
  { key: "ai_fraud_detection", name: "AI Fraud Detection" },
  { key: "api_access_for_institution", name: "API Access for Institutions" },
];

function SelectPlan() {
  const { planName } = useParams();
  const navigate = useNavigate();
  const loggedonuser = localStorage.getItem("emailLoggedIn") || "User";
  const [plansData, setPlansData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setError("No auth token found. Please log in again.");
          navigate("/login");
          return;
        }

        const response = await fetch("https://cip-6vcm.onrender.com/process/get-all-plans", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError("Session expired. Please log in again.");
            localStorage.removeItem("authToken");
            navigate("/login");
            return;
          }
          const errorData = await response.json();
          console.log("API Error in SelectPlan:", response.status, errorData);
          throw new Error("Failed to fetch plans");
        }

        const data = await response.json();
        console.log("Fetched plans in SelectPlan:", JSON.stringify(data, null, 2));

        // Transform plans array into object with plan keys
        const transformedPlans = data.plans.reduce((acc, plan) => {
          const planKey = plan.name.toLowerCase().replace(/\s+/g, "");
          const features = featureFields.map(field => ({
            name: field.name,
            available: plan[field.key] ?? false,
          }));

          acc[planKey] = {
            id: plan.id,
            name: plan.name || `Plan ${plan.id}`,
            price: plan.price || "N/A",
            payment: undefined, // Not in API response
            billing: undefined, // Not in API response
            features: features,
          };
          return acc;
        }, {});

        setPlansData(transformedPlans);

        const normalizedPlanName = planName?.toLowerCase().replace(/\s+/g, "");
        if (!transformedPlans[normalizedPlanName]) {
          navigate("/plans");
        }
      } catch (err) {
        setError(err.message || "Failed to load plans.");
        navigate("/plans");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [navigate, planName]);

  const handleSelectPlan = async (planKey) => {
    if (planKey !== planName?.toLowerCase().replace(/\s+/g, "")) {
      navigate(`/select-plan/${planKey}`);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("No auth token found. Please log in again.");
        navigate("/login");
        return;
      }

      const plan = plansData[planKey];
      if (!plan.id) {
        setError("Plan ID is missing for this plan. Please contact support.");
        return;
      }

      const response = await fetch(
        `https://cip-6vcm.onrender.com/process/user-select-plan?plan_id=${plan.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          setError("Session expired. Please log in again.");
          localStorage.removeItem("authToken");
          navigate("/login");
          return;
        }
        const errorData = await response.json();
        console.log("Select Plan Error:", response.status, errorData);
        throw new Error("Failed to select plan");
      }

      const data = await response.json();
      console.log("Select Plan Response:", data);
      localStorage.setItem("userPlan", planKey);

      setTimeout(() => {
        setHasRedirected(true);
        navigate(`/dashboard/${planKey}`, { replace: true });
      }, 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="plans-container">
        <Assets />
        <div className="plans-header">
          <div className="logo">
            <img src={cipLogo} alt="CIP Logo" className="logo-image" />
          </div>
          <div className="user-info">
            <span className="hello-text">Hello</span>
            <span className="afolabi-text">{loggedonuser}</span>
            <img src={profile} alt="User Avatar" className="user-avatar" />
            <img src={dropdown} alt="Dropdown Arrow" className="dropdown-arrow" />
          </div>
        </div>
        <h1>Loading Plan Details...</h1>
        <div className="plans-grid">
          <p style={{ padding: "20px", textAlign: "center" }}>
            Fetching your plan details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="plans-container">
        <Assets />
        <div className="plans-header">
          <div className="logo">
            <img src={cipLogo} alt="CIP Logo" className="logo-image" />
          </div>
          <div className="user-info">
            <span className="hello-text">Hello</span>
            <span className="afolabi-text">{loggedonuser}</span>
            <img src={profile} alt="User Avatar" className="user-avatar" />
            <img src={dropdown} alt="Dropdown Arrow" className="dropdown-arrow" />
          </div>
        </div>
        <h1>Error Loading Plans</h1>
        <div className="plans-grid">
          <p style={{ color: "red", padding: "20px", textAlign: "center" }}>
            {error}
          </p>
          <p style={{ textAlign: "center" }}>
            Please try again later or contact support.
          </p>
        </div>
      </div>
    );
  }

  if (Object.keys(plansData).length === 0) {
    return (
      <div className="plans-container">
        <Assets />
        <div className="plans-header">
          <div className="logo">
            <img src={cipLogo} alt="CIP Logo" className="logo-image" />
          </div>
          <div className="user-info">
            <span className="hello-text">Hello</span>
            <span className="afolabi-text">{loggedonuser}</span>
            <img src={profile} alt="User Avatar" className="user-avatar" />
            <img src={dropdown} alt="Dropdown Arrow" className="dropdown-arrow" />
          </div>
        </div>
        <h1>No Plans Available</h1>
        <div className="plans-grid">
          <p style={{ padding: "20px", textAlign: "center" }}>
            No plans available to select. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  const normalizedPlanName = planName?.toLowerCase().replace(/\s+/g, "");
  if (!plansData[normalizedPlanName]) {
    navigate("/plans");
    return null; // Prevent rendering during navigation
  }

  return (
    <div className="plans-container">
      <Assets />
      <div className="plans-header">
        <div className="logo">
          <img src={cipLogo} alt="CIP Logo" className="logo-image" />
        </div>
        <div className="user-info">
          <span className="hello-text">Hello</span>
          <span className="afolabi-text">{loggedonuser}</span>
          <img src={profile} alt="User Avatar" className="user-avatar" />
          <img src={dropdown} alt="Dropdown Arrow" className="dropdown-arrow" />
        </div>
      </div>
      <h1>Confirm Your Plan Selection</h1>
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
                {plan.features.length > 0 ? (
                  plan.features.map((feature, index) => (
                    <li
                      key={index}
                      className={feature.available ? "feature-available" : "feature-unavailable"}
                    >
                      {feature.name}
                    </li>
                  ))
                ) : (
                  <li className="feature-unavailable">No features available</li>
                )}
              </ul>
              <button
                className={`select-plan-button ${isSelected ? "selected" : ""}`}
                onClick={() => handleSelectPlan(planKey)}
              >
                {isSelected ? "Confirm Selection" : "Select Plan"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SelectPlan;