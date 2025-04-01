import React from "react";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import AllRoutes from "./Routes/AllRoutes";
import { useLocation } from "react-router-dom";

const App = () => {
  const location = useLocation();

  const noNavbar = ["/login", "/signup"];

  return (
    <div>
      {!noNavbar.includes(location.pathname) && <Navbar />}
      <AllRoutes />
    </div>
  );
};

export default App;
