// import React from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { Link, useNavigate } from "react-router-dom";
// import { logout } from "../features/auth/authSlice";
// import axios from "axios";
// import "./Navbar.css";

// const Navbar = () => {
//   const { user } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     axios
//       .get("http://localhost:5000/auth/logout", { withCredentials: true })
//       .then(() => {
//         dispatch(logout());
//         navigate("/");
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   };

//   return (
//     <nav className="navbar">
//       <Link to="/" className="navbar-brand">
//         Smart Chat App
//       </Link>

//       <div className="navbar-links">
//         {user ? (
//           <>
//             <Link to="/dashboard" className="navbar-link">
//               Dashboard
//             </Link>
//             <Link to="/rooms" className="navbar-link">
//               Room
//             </Link>
//             <button onClick={handleLogout} className="navbar-button">
//               Logout
//             </button>
//           </>
//         ) : (
//           <>
//             <Link to="/" className="navbar-link">
//               Login
//             </Link>
//             <Link to="/register" className="navbar-link">
//               Register
//             </Link>
//           </>
//         )}
//       </div>
//     </nav>
//   );
// };

// export default Navbar;

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../features/auth/authSlice";
import axios from "axios";
import "./Navbar.css";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:5000/auth/logout", {
        withCredentials: true,
      });
      dispatch(logout());
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Confera
      </Link>

      <div className="navbar-links">
        {user ? (
          <>
            <Link to="/dashboard" className="navbar-link">
              Dashboard
            </Link>
            <Link to="/rooms" className="navbar-link">
              Room
            </Link>
            <button onClick={handleLogout} className="navbar-button">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/" className="navbar-link">
              Login
            </Link>
            <Link to="/register" className="navbar-link">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
