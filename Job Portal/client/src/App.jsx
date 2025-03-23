import React from "react";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import AllRoutes from "./Routes/AllRoutes";

const App = () => {
  return (
    <div>
      <Navbar/>
      <AllRoutes />
    </div>
  );
};

export default App;
