import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase/firebase.config";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";

// Create the AuthContext
const AuthContext = createContext();

// Custom hook for using AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};

// Initialize GoogleAuthProvider
const googleProvider = new GoogleAuthProvider();

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Added error state

  // Register a user
  const registerUser = async (email, password) => {
    try {
      return await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message); // Capture error for debugging
      throw err; // Re-throw the error to handle it in the component
    }
  };

  // Log in the user
  const loginUser = async (email, password) => {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message); // Capture error for debugging
      throw err; // Re-throw the error to handle it in the component
    }
  };

  // Sign up with Google
  const signInWithGoogle = async () => {
    try {
      return await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(err.message); // Capture error for debugging
      throw err;
    }
  };

  // Log out the user
  const logout = () => {
    return signOut(auth);
  };

  // Manage user state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);

      if (user) {
        const { email, displayName, photoURL } = user;
        const userData = {
          email,
          username: displayName,
          photo: photoURL,
        };
        console.log("User data:", userData); // Optional for debugging
      }
    });

    return () => unsubscribe();
  }, []);

  // Context value
  const value = {
    currentUser,
    loading,
    error, // Provide error state
    registerUser,
    loginUser,
    signInWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
