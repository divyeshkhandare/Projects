import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../config/api";
import Cookie from "js-cookie";
import { motion } from "motion/react";

const Signup = () => {
  const [clicked, setClicked] = useState(false);

  const nav = useNavigate();
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "Candidate",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setClicked(true);
    try {
      let res = await API.post("/user/signup", user);
      Cookie.set("token", res.data.token);
      console.log(res.data);
      nav("/");
    } catch (error) {
      console.log(error);
      setClicked(false);
    }
  };

  const StyleSheet = () => {
    return (
      <style>
        {`
            .container {
                display: flex;
                justify-content: center;
                align-items: center;
                border-radius: 8px;
            }

            .spinner {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                border: 4px solid var(--divider);
                border-top-color: #000;
                will-change: transform;
            }
            `}
      </style>
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.3,
        }}
        className="min-h-screen flex items-center"
      >
        <div className="w-[408px] h-[724px] mx-auto flex flex-col justify-between">
          {/* Top Buttons */}
          <div className="text-center">
            <button className="bg-[#E9EBFD] px-4 py-2 text-[#4640DE] font-semibold text-base">
              Job Seeker
            </button>
            <button className="px-4 py-2 text-[#4640DE] font-semibold text-base">
              Company
            </button>
          </div>

          <h1 className="text-3xl font-semibold text-center ">
            Get more opportunities
          </h1>

          <button className="w-full border border-[#CCCCF5] py-3 text-[#4640DE] text-base font-bold flex items-center justify-center gap-2 mt-4">
            <FcGoogle className="text-xl" /> Sign Up with Google
          </button>

          <div className="flex items-center gap-3">
            <span className="h-[1px] w-[20px] bg-[#D6DDEB] flex-1"></span>
            <p className=" text-[#202430]">Or sign up with email</p>
            <span className="h-[1px] w-[20px] bg-[#D6DDEB] flex-1"></span>
          </div>

          {/* Form */}
          <div>
            <form className="space-y-[22px]" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="Full Name"
                  className="block text-base font-semibold align-text-top text-[#515B6F] leading-7"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="px-[16px] py-[12px] border-[#D6DDEB] border w-full"
                  name="name"
                  value={user.name}
                  onChange={handleChange}
                />
              </div>
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
                <motion.button
                  whileHover={{
                    scale: 1,
                    transition: { duration: 0.3 },
                  }}
                  whileTap={{ scale: 0.8 }}
                  className="bg-[#4640DE] py-[12px] px-[24px] text-white text-base font-bold w-full flex justify-center items-center gap-[20px] cursor-pointer"
                  type="submit"
                >
                  {clicked ? (
                    <motion.div
                      className="w-6 h-6 border-4 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  ) : (
                    "Sign Up"
                  )}
                </motion.button>
              </div>
            </form>
          </div>
          <p className="text-base">
            Already have an account?
            <Link to={"/login"} className="text-[#4640DE] font-semibold">
              Login
            </Link>
          </p>
          <p className="text-sm">
            By clicking 'Continue', you acknowledge that you have read and
            accept the <span className="text-[#4640DE]">Terms of Service</span>{" "}
            and <span className="text-[#4640DE]">Privacy Policy.</span>
          </p>
        </div>
      </motion.div>
    </>
  );
};

export default Signup;
