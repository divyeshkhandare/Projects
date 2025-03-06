import React from "react";

import { Navigate } from "react-router-dom";
import { getUserDetails } from "../userDetails";

const PrivateRoute = ({ children }) => {
  const user = getUserDetails();
  if (!user) {
    return <Navigate to="/login" />;
  } else {
    return children;
  }
};

export default PrivateRoute;
