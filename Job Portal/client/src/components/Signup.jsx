import React, { useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import {
  signupUser,
  clearError,
  clearFormErrors,
} from "../store/slices/authSlice";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object().shape({
  name: yup.string().required("Full name is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

const Signup = () => {
  const nav = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [userType, setUserType] = React.useState("Candidate");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "Candidate",
    },
  });

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearFormErrors());
    return () => reset();
  }, [dispatch, reset]);

  const onSubmit = async (data) => {
    try {
      const signupData = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: userType,
      };

      const result = await dispatch(signupUser(signupData));

      if (result.payload) {
        nav("/");
      }
    } catch (error) {
      console.error("Signup failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F8FD]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-[90%] sm:w-[408px] mx-auto flex flex-col justify-between p-4 sm:p-8 bg-white rounded-xl shadow-lg"
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-2xl sm:text-3xl font-semibold text-center text-[#25324B] mb-4 sm:mb-6"
        >
          Create Account
        </motion.h1>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full border border-[#CCCCF5] py-2.5 sm:py-3 text-[#4640DE] text-sm sm:text-base font-bold flex items-center justify-center gap-2 rounded-lg hover:bg-[#4640DE] hover:text-white transition-colors duration-300"
        >
          <FcGoogle className="text-lg sm:text-xl" /> Sign up with Google
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex items-center gap-2 sm:gap-3 my-4 sm:my-6"
        >
          <span className="h-[1px] bg-[#D6DDEB] flex-1"></span>
          <p className="text-[#202430] text-xs sm:text-sm">
            Or sign up with email
          </p>
          <span className="h-[1px] bg-[#D6DDEB] flex-1"></span>
        </motion.div>

        {/* User Type Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-4 sm:mb-6"
        >
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setUserType("Candidate")}
              className={`flex-1 py-2 px-3 sm:px-4 rounded-lg text-center text-xs sm:text-sm transition-colors duration-300 ${
                userType === "Candidate"
                  ? "bg-[#4640DE] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Job Seeker
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setUserType("HR")}
              className={`flex-1 py-2 px-3 sm:px-4 rounded-lg text-center text-xs sm:text-sm transition-colors duration-300 ${
                userType === "HR"
                  ? "bg-[#4640DE] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Company
            </motion.button>
          </div>
        </motion.div>

        <form
          className="space-y-4 sm:space-y-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <label
              htmlFor="name"
              className="block text-xs sm:text-sm font-medium text-[#25324B] mb-1"
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              placeholder="Enter your full name"
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border ${
                errors.name ? "border-red-500" : "border-[#D6DDEB]"
              } focus:outline-none focus:ring-2 focus:ring-[#4640DE] transition-all duration-300 text-sm sm:text-base`}
              {...register("name")}
            />
            {errors.name && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-xs sm:text-sm mt-1"
              >
                {errors.name.message}
              </motion.p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <label
              htmlFor="email"
              className="block text-xs sm:text-sm font-medium text-[#25324B] mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border ${
                errors.email ? "border-red-500" : "border-[#D6DDEB]"
              } focus:outline-none focus:ring-2 focus:ring-[#4640DE] transition-all duration-300 text-sm sm:text-base`}
              {...register("email")}
            />
            {errors.email && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-xs sm:text-sm mt-1"
              >
                {errors.email.message}
              </motion.p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            <label
              htmlFor="password"
              className="block text-xs sm:text-sm font-medium text-[#25324B] mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border ${
                  errors.password ? "border-red-500" : "border-[#D6DDEB]"
                } focus:outline-none focus:ring-2 focus:ring-[#4640DE] transition-all duration-300 text-sm sm:text-base`}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-300"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {errors.password && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-xs sm:text-sm mt-1"
              >
                {errors.password.message}
              </motion.p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.4 }}
          >
            <label
              htmlFor="confirmPassword"
              className="block text-xs sm:text-sm font-medium text-[#25324B] mb-1"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                placeholder="Confirm your password"
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border ${
                  errors.confirmPassword ? "border-red-500" : "border-[#D6DDEB]"
                } focus:outline-none focus:ring-2 focus:ring-[#4640DE] transition-all duration-300 text-sm sm:text-base`}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-300"
              >
                {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-xs sm:text-sm mt-1"
              >
                {errors.confirmPassword.message}
              </motion.p>
            )}
          </motion.div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-red-500 text-xs sm:text-sm text-center"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-[#4640DE] py-2.5 sm:py-3 text-white text-sm sm:text-base font-bold rounded-lg flex justify-center items-center gap-2 hover:bg-[#3a35c0] transition-colors duration-300"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <motion.div
                className="w-5 h-5 sm:w-6 sm:h-6 border-4 border-white border-t-transparent rounded-full"
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
        </form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.6 }}
          className="text-center text-xs sm:text-sm text-[#25324B] mt-4 sm:mt-6"
        >
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#4640DE] font-semibold hover:underline transition-colors duration-300"
          >
            Login
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Signup;
