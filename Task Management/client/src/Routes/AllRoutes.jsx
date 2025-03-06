import React from "react";
import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Home from "../pages/Home";
import { Ability } from "../role/Ability";
import Assign from "../pages/Assign";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import PageNotFound from "../pages/PageNotFound";
import TaskDetails from "../pages/TaskDetails";

const AllRoutes = () => {
  return (
    <div>
      <Routes>
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        {Ability(["admin"]) ? (
          <Route
            path="/assign-task"
            element={
              <PrivateRoute>
                <Assign />
              </PrivateRoute>
            }
          />
        ) : (
          ""
        )}
        <Route path="/task-details/:id" element={<TaskDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </div>
  );
};

export default AllRoutes;
