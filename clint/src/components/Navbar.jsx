import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../features/auth/authSlice";
import axios from "axios";
import "./Navbar.css";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.get("https://confera.onrender.com/auth/logout", {
        withCredentials: true,
      });
      dispatch(logout());
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Confera
      </Link>

      <button className="hamburger" onClick={toggleMenu}>
        ☰
      </button>

      <div className={`navbar-links ${menuOpen ? "active" : ""}`}>
        {user ? (
          <>
            <Link to="/dashboard" className="navbar-link" onClick={toggleMenu}>
              Dashboard
            </Link>
            <Link to="/rooms" className="navbar-link" onClick={toggleMenu}>
              Room
            </Link>
            <button
              onClick={() => {
                handleLogout();
                toggleMenu();
              }}
              className="navbar-button"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/" className="navbar-link" onClick={toggleMenu}>
              Login
            </Link>
            <Link to="/register" className="navbar-link" onClick={toggleMenu}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
