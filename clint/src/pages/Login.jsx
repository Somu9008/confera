import React, { useState } from "react";
import axios from "axios";
import { FcGoogle } from "react-icons/fc";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setUser } from "../features/auth/authSlice";
import "./Login.css";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        form,
        {
          withCredentials: true,
        }
      );
      dispatch(setUser(res.data));
      localStorage.setItem("user", JSON.stringify(res.data));
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed.");
    }
  };

  const handleGoogleLogin = () => {
    window.open("http://localhost:5000/auth/google", "_self");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Login</h2>
        {error && <p className="login-error">{error}</p>}
        <form onSubmit={handleSubmit} autoComplete="off" className="login-form">
          <input
            className="login-input"
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            autoComplete="new-email"
          />

          <input
            className="login-input"
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
          />

          <button type="submit" className="login-button">
            Login
          </button>
        </form>

        <p className="login-register-link">
          Don't have an account? <Link to="/register">Register</Link>
        </p>

        <div className="login-divider">OR</div>

        <button onClick={handleGoogleLogin} className="google-login-button">
          <FcGoogle size={20} />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
