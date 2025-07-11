import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const PrivateRoutes = ({ children }) => {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <div className="spinner">Loading...</div>; // Replace with a spinner if needed
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoutes;
