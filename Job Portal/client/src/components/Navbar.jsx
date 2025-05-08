import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMenu, FiX, FiSearch, FiUser } from "react-icons/fi";
import logo from "/image.png";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Find Jobs", path: "/jobs" },
    { name: "Browse Companies", path: "/companies" },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <div className="flex items-center gap-4 sm:gap-12">
            <Link to="/" className="flex-shrink-0">
              <motion.img
                whileHover={{ scale: 1.05 }}
                src={logo}
                alt="logo"
                className="h-7 sm:h-9 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm sm:text-base font-medium transition-colors duration-300 ${
                    location.pathname === link.path
                      ? "text-[#4640DE]"
                      : "text-gray-600 hover:text-[#4640DE]"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 sm:px-6 py-2 sm:py-2.5 font-bold text-sm sm:text-base text-[#4640DE] hover:bg-[#4640DE]/5 rounded-lg transition-colors duration-300"
              >
                Login
              </motion.button>
            </Link>
            <span className="w-[2px] h-6 sm:h-8 bg-[#D6DDEB]"></span>
            <Link to="/signup">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 sm:px-6 py-2 sm:py-2.5 font-bold text-sm sm:text-base bg-[#4640DE] text-white rounded-lg hover:bg-[#3a35c0] transition-colors duration-300"
              >
                Sign Up
              </motion.button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-[#4640DE] focus:outline-none"
            >
              {isMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{ height: isMenuOpen ? "auto" : 0 }}
        className="md:hidden overflow-hidden bg-white shadow-lg"
      >
        <div className="px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`block px-3 py-2 text-base font-medium rounded-lg ${
                location.pathname === link.path
                  ? "bg-[#4640DE]/10 text-[#4640DE]"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 space-y-2">
            <Link to="/login" onClick={() => setIsMenuOpen(false)}>
              <button className="w-full px-4 py-2 text-base font-medium text-[#4640DE] hover:bg-[#4640DE]/5 rounded-lg transition-colors duration-300">
                Login
              </button>
            </Link>
            <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
              <button className="w-full px-4 py-2 text-base font-medium bg-[#4640DE] text-white rounded-lg hover:bg-[#3a35c0] transition-colors duration-300">
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.header>
  );
};

export default Navbar;
