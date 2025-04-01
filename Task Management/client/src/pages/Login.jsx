import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import cookie from "js-cookie";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API from "../config/API";

const Login = () => {
  const nav = useNavigate();

  const [user, setUser] = useState({
    email: "",
    password: "",
  });
  useEffect(() => {
    if (cookie.get("token")) {
      nav("/", { replace: true });
    }
  }, [nav]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value,
    });
  };

  const loginUser = async (data) => {
    try {
      const res = await API.post("/user/login", data);
      const { user, token } = res.data;
      cookie.set("token", token, { expires: 1 });
      toast.success("Login successful!", {
        position: "top-center",
        autoClose: 3000,
      });
      nav("/");
    } catch (error) {
      toast.error("Invalid email or password!", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loginUser(user);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form
        className="bg-white p-6 rounded-lg shadow-md max-w-md w-full"
        onSubmit={handleSubmit}
      >
        <div className="relative z-0 w-full mb-5 group">
          <input
            type="email"
            name="email"
            id="floating_email"
            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            value={user.email}
            onChange={handleChange}
            required
          />
          <label
            htmlFor="floating_email"
            className="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 peer-focus:text-blue-600"
          >
            Email address
          </label>
        </div>
        <div className="relative z-0 w-full mb-5 group">
          <input
            type="password"
            name="password"
            id="floating_password"
            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            value={user.password}
            onChange={handleChange}
            required
          />
          <label
            htmlFor="floating_password"
            className="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 peer-focus:text-blue-600"
          >
            Password
          </label>
        </div>
        <button
          type="submit"
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default Login;
