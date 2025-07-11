import { react, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setUser } from "./features/auth/authSlice";
import Register from "./pages/Register";
import PrivateRoutes from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import RoomList from "./pages/RoomList";
import Room from "./pages/Room";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    axios
      .get("https://confera.onrender.com/auth/user", { withCredentials: true })
      .then((res) => {
        if (res.data) {
          localStorage.setItem("user", JSON.stringify(res.data));
          dispatch(setUser(res.data));
        }
      })
      .catch((err) => {
        dispatch(setUser(null));
      });
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoutes>
              <Dashboard />
            </PrivateRoutes>
          }
        />
        <Route
          path="/rooms"
          element={
            <PrivateRoutes>
              <RoomList />
            </PrivateRoutes>
          }
        />
        <Route
          path="/rooms/:roomId"
          element={
            <PrivateRoutes>
              <Room />
            </PrivateRoutes>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
