import React from "react";
import { Route, Routes } from "react-router-dom";
import Signup from "../components/Signup";
import Login from "../components/Login";
import Dashboard from "../pages/dashboard/Dashboard";

const AllRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard/>} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
};

export default AllRoutes;
