import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { getUserDetails } from "../userDetails";
import { Ability } from "../role/Ability";

const Navbar = () => {
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const [isLogged, setIsLogged] = useState(!!Cookies.get("token"));
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setUser(getUserDetails());
  }, []);

  const logout = () => {
    Cookies.remove("token");
    Cookies.remove("jwt");
    setIsLogged(false);
    setUser(null);
    nav("/login");
  };

  return (
    <nav className="bg-gray-900 shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="text-white text-2xl font-bold">
          <Link to="/" className="hover:text-gray-400 transition-colors">
            📝 Task Manager
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-white hover:text-gray-400 transition">
            Dashboard
          </Link>
          {Ability(["admin"]) && (
            <Link to="/assign-task" className="text-white hover:text-gray-400 transition">
              Assign Task
            </Link>
          )}
          {user ? (
            <span className="text-white px-4 py-1 rounded-lg bg-gray-700">
              {user.name}
            </span>
          ) : (
            <Link to="/signup" className="text-white hover:text-gray-400 transition">
              Sign Up
            </Link>
          )}
          {isLogged ? (
            <button
              onClick={logout}
              className="text-white bg-red-600 hover:bg-red-500 px-4 py-1 rounded-lg transition"
            >
              Logout
            </button>
          ) : (
            <Link to="/login" className="text-white bg-blue-600 hover:bg-blue-500 px-4 py-1 rounded-lg transition">
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-white">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="md:hidden bg-gray-800 p-4 space-y-3">
          <Link to="/" className="block text-white hover:text-gray-400 transition">
            Dashboard
          </Link>
          {Ability(["admin"]) && (
            <Link to="/assign-task" className="block text-white hover:text-gray-400 transition">
              Assign Task
            </Link>
          )}
          {user ? (
            <span className="block text-white px-4 py-1 rounded-lg bg-gray-700">{user.name}</span>
          ) : (
            <Link to="/signup" className="block text-white hover:text-gray-400 transition">
              Sign Up
            </Link>
          )}
          {isLogged ? (
            <button
              onClick={logout}
              className="block w-full text-left text-white bg-red-600 hover:bg-red-500 px-4 py-1 rounded-lg transition"
            >
              Logout
            </button>
          ) : (
            <Link to="/login" className="block text-white bg-blue-600 hover:bg-blue-500 px-4 py-1 rounded-lg transition">
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
