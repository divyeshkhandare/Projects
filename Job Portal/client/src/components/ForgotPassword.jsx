import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../config/api";
import { motion } from "framer-motion";
import { FiArrowLeft } from "react-icons/fi";

const ForgotPassword = () => {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email is invalid";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await API.post("/user/forgot-password", { email });
      setSuccess("Password reset link has been sent to your email");
    } catch (error) {
      setError(error.response?.data?.message || "An error occurred while sending reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center bg-gradient-to-br from-gray-50 to-gray-100">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-[90%] sm:w-[408px] mx-auto flex flex-col justify-between p-4 sm:p-8 bg-white rounded-xl shadow-lg"
      >
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => nav(-1)}
            className="flex items-center text-[#4640DE] hover:text-[#3a35c0] transition-colors duration-300"
          >
            <FiArrowLeft className="mr-2" size={18} />
            <span className="text-sm sm:text-base">Back to Login</span>
          </button>
        </div>

        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-2xl sm:text-3xl font-semibold text-center text-gray-800 mb-2"
        >
          Forgot Password
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center text-xs sm:text-sm text-gray-600 mb-6 sm:mb-8"
        >
          Enter your email address and we'll send you a link to reset your password
        </motion.p>

        <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <label
              htmlFor="email"
              className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email address"
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border ${
                formErrors.email ? "border-red-500" : "border-[#D6DDEB]"
              } focus:outline-none focus:ring-2 focus:ring-[#4640DE] transition-all duration-300 text-sm sm:text-base`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {formErrors.email && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-xs sm:text-sm mt-1"
              >
                {formErrors.email}
              </motion.p>
            )}
          </motion.div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-xs sm:text-sm text-center"
            >
              {error}
            </motion.p>
          )}

          {success && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-green-500 text-xs sm:text-sm text-center"
            >
              {success}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-[#4640DE] py-2.5 sm:py-3 text-white text-sm sm:text-base font-bold rounded-lg flex justify-center items-center gap-2 hover:bg-[#3a35c0] transition-colors duration-300"
          >
            {loading ? (
              <motion.div
                className="w-5 h-5 sm:w-6 sm:h-6 border-4 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            ) : (
              "Send Reset Link"
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default ForgotPassword; 