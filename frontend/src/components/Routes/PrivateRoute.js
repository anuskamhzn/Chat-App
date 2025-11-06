// src/routes/PrivateRoute.jsx
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const auth = JSON.parse(localStorage.getItem("auth"));

  // if no auth found, redirect to login page
  if (!auth) {
    return <Navigate to="/" />;
  }

  // otherwise, allow access
  return <Outlet />;
};

export default PrivateRoute;
