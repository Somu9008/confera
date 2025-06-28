import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "../features/auth/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import "./Register.css";

const Register = () => {
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // clear error when typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        form,
        { withCredentials: true }
      );
      localStorage.setItem("user", JSON.stringify(res.data));
      dispatch(setUser(res.data));
      setForm({ displayName: "", email: "", password: "" });
      navigate("/dashboard");
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again later."
      );
    }
  };

  const handleGoogleLogin = () => {
    window.open("http://localhost:5000/auth/google", "_self");
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="register-form"
        >
          <h2 className="register-title">Register</h2>

          {error && <p className="register-error">{error}</p>}

          <input
            name="displayName"
            placeholder="Name"
            value={form.displayName}
            onChange={handleChange}
            className="register-input"
            autoComplete="new-name"
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="register-input"
            autoComplete="new-email"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="register-input"
            autoComplete="new-password"
          />

          <button type="submit" className="register-button">
            Sign Up
          </button>
        </form>

        <p className="register-login-link">
          Already have an account? <Link to="/">Login</Link>
        </p>

        <div className="register-divider">OR</div>

        <button onClick={handleGoogleLogin} className="google-register-button">
          <FcGoogle size={20} />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Register;
