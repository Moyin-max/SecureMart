import React, { useState, useEffect } from "react";

export default function App() {
  const [alerts, setAlerts] = useState([]);
  const [locked, setLocked] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [lastAlert, setLastAlert] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {

      const isSuspicious = Math.random() > 0.6;

      const message = isSuspicious
        ? "🤖 Suspicious behaviour detected!"
        : "Motion detected in store!";

      const newAlert = {
        time: new Date().toLocaleTimeString(),
        message: message,
        type: isSuspicious ? "ai" : "motion"
      };

      setAlerts((prev) => [newAlert, ...prev]);
      setLastAlert(message);

      // 🔊 Play alarm sound
      const alarm = new Audio("https://www.soundjay.com/buttons/beep-01a.mp3");
      alarm.play();

      // 🚨 Show popup
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);

    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        fontFamily: "Arial",
        background: "#0f172a",
        minHeight: "100vh",
        color: "white",
        padding: "20px"
      }}
    >

      {/* 🚨 POPUP ALERT */}
      {showPopup && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: "#dc2626",
            padding: "15px",
            borderRadius: "8px",
            fontWeight: "bold",
            boxShadow: "0 0 10px rgba(0,0,0,0.5)"
          }}
        >
          🚨 {lastAlert}
        </div>
      )}

      <h1 style={{ fontSize: "28px", marginBottom: "20px" }}>
        🏪 SecureMart Dashboard
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "20px"
        }}
      >

        {/* 📷 Camera Feed */}
        <div
          style={{
            background: "#1e293b",
            padding: "15px",
            borderRadius: "10px"
          }}
        >
          <h2>📷 Live Camera</h2>

          <div style={{ position: "relative" }}>
            <img
              src="https://via.placeholder.com/600x350"
              alt="camera"
              style={{
                width: "100%",
                borderRadius: "10px",
                marginTop: "10px"
              }}
            />

            {/* 🔴 AI Detection Box */}
            <div
              style={{
                position: "absolute",
                top: "60px",
                left: "120px",
                width: "150px",
                height: "100px",
                border: "3px solid red"
              }}
            ></div>

            <p
              style={{
                position: "absolute",
                top: "40px",
                left: "120px",
                color: "yellow",
                fontWeight: "bold"
              }}
            >
              Suspicious Activity
            </p>
          </div>
        </div>

        {/* 🚨 Alerts Panel */}
        <div
          style={{
            background: "#1e293b",
            padding: "15px",
            borderRadius: "10px",
            maxHeight: "400px",
            overflowY: "auto"
          }}
        >
          <h2>🚨 Alerts</h2>

          {alerts.map((alert, i) => (
            <div
              key={i}
              style={{
                background: alert.type === "ai" ? "#b91c1c" : "#7f1d1d",
                marginTop: "10px",
                padding: "10px",
                borderRadius: "6px",
                borderLeft:
                  alert.type === "ai"
                    ? "5px solid yellow"
                    : "5px solid red"
              }}
            >
              {alert.time} - {alert.message}
            </div>
          ))}
        </div>
      </div>

      {/* 🚪 Door Control */}
      <div
        style={{
          marginTop: "20px",
          background: "#1e293b",
          padding: "15px",
          borderRadius: "10px"
        }}
      >
        <h2>🚪 Door Control</h2>

        <button
          onClick={() => setLocked(!locked)}
          style={{
            padding: "12px 20px",
            background: locked ? "#dc2626" : "#16a34a",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            cursor: "pointer"
          }}
        >
          {locked ? "Unlock Door" : "Lock Door"}
        </button>

        <p style={{ marginTop: "10px" }}>
          Status: {locked ? "Locked 🔒" : "Unlocked 🔓"}
        </p>
      </div>
    </div>
  );
}