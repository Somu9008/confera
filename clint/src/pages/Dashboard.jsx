import React from "react";
import { useSelector } from "react-redux";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="dashboard-container">
      <img src="/logo.png" alt="Confera Logo" className="dashboard-logo" />
      <h2 className="dashboard-title">
        🎯 Welcome to Confera, {user?.displayName || "User"}!
      </h2>
      <p className="dashboard-subtext">
        Smart Video Conferencing & Real-Time Chat
      </p>
    </div>
  );
};

export default Dashboard;
