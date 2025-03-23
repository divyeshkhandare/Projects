import React, { useState } from "react";
import logo from "/image.png";

const Navbar = () => {
  return (
    <div>
      <header className="w-full h-[78px] flex items-center justify-between px-32">
        <div className="flex items-center gap-12 w-[452px]">
          <div>
            <img src={logo} alt="logo" width={"160px"} height={"36px"} />
          </div>
          <nav className="text-base font-medium flex gap-4 cursor-pointer">
            <p>Find Jobs</p>
            <p>Browse Companies</p>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <button className="px-6 py-3 font-bold text-base text-[#4640DE] cursor-pointer">Login</button>
          <span className="w-[2px] h-12 bg-[#D6DDEB]"></span>
          <button className="font-bold text-base px-6 py-3 bg-[#4640DE] text-white cursor-pointer">Sign Up</button>
        </div>
      </header>
    </div>
  );
};

export default Navbar;
