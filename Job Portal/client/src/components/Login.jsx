import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../config/api";
import Cookie from "js-cookie";
 
const Login = () => {

  const nav = useNavigate()

  const [ user, setUser ] =useState({
    email: "",
    password: ""
  })

  const handleChange = (e) => {
    setUser({
     ...user,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async(e) => {
    e.preventDefault();
    let res = await API.post("/user/signin", user);
    Cookie.set("token", res.data.token);
    nav("/");
  }

  return (
    <div className="min-h-screen flex items-center">
      <div className="w-[408px] h-[582px] mx-auto flex flex-col justify-between">
        {/* Top Buttons */}

        <h1 className="text-3xl font-semibold text-center ">
          Welcome Back,Dude
        </h1>

        <button className="w-full border border-[#CCCCF5] py-3 text-[#4640DE] text-base font-bold flex items-center justify-center gap-2 mt-4">
          <FcGoogle className="text-xl" /> Login with Google
        </button>

        <div className="flex items-center gap-3">
          <span className="h-[1px] w-[20px] bg-[#D6DDEB] flex-1"></span>
          <p className=" text-[#202430]">Or login with email</p>
          <span className="h-[1px] w-[20px] bg-[#D6DDEB] flex-1"></span>
        </div>

        {/* Form */}
        <div>
          <form className="space-y-[22px]" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="Email Address"
                className="block text-base font-semibold align-text-top text-[#515B6F] leading-7"
              >
                Email Address
              </label>
              <input
                type="text"
                placeholder="Enter your email address"
                className="px-[16px] py-[12px] border-[#D6DDEB] border w-full"
                name="email"
                value={user.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                htmlFor="Password"
                className="block text-base font-semibold align-text-top text-[#515B6F] leading-7"
              >
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="px-[16px] py-[12px] border-[#D6DDEB] border w-full"
                name="password"
                value={user.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <button className="bg-[#4640DE] py-[12px] px-[24px] text-white text-base font-bold w-full">
                Login
              </button>
            </div>
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id="rememberMe"
                className="mr-2 w-4 h-4 accent-[#4640DE] cursor-pointer"
              />
              <label
                htmlFor="rememberMe"
                className="text-[#515B6F] text-base cursor-pointer"
              >
                Remember Me
              </label>
            </div>
          </form>
        </div>
        <p className="text-base">
          Don't have an account?{" "}
          <Link
            to={"/signup"}
            className="text-[#4640DE] font-semibold cursor-pointer"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
