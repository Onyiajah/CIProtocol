import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  // Check if the user is logged in with either email/password or MetaMask
  const emailLoggedIn = localStorage.getItem("emailLoggedIn");
  const walletAddress = localStorage.getItem("walletAddress");

  if (!emailLoggedIn && !walletAddress) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default ProtectedRoute;