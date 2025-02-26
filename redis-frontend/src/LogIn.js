import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './Login.css';

function LogIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "krazzyy") {
      navigate("/dashboard");  // ✅ Redirect to dashboard
    } else {
      alert("Invalid credentials!");
    }
  };

  return (
    <div className="login-page"> {/* ✅ Background only applies here */}
      <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="login-btn" type="submit">Log In</button>
        </form>
      </div>
    </div>
  );
}

export default LogIn;
