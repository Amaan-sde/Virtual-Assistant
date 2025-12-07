// src/context/UserContext.jsx

import { useEffect, useState, createContext } from "react";
import axios from "axios";

// Create the context
export const userDataContext = createContext(null);

export default function UserContext({ children }) {
  const serverUrl = "https://virtual-assistant-backend-23w4.onrender.com";

  // ---------------------
  // State
  // ---------------------
  const [userData, setUserData] = useState(null);
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // ---------------------
  // Fetch current user
  // ---------------------
  const handleCurrentUser = async () => {
    try {
      const response = await axios.get(`${serverUrl}/api/user/current`, {
        withCredentials: true,
      });
      setUserData(response.data.user);
    } catch (err) {
      console.error("Error fetching current user:", err);
    }
  };

  // ---------------------
  // Gemini API request
  // ---------------------
  const getGeminiResponse = async (command) => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/user/asktoassistant`,
        { command },
        { withCredentials: true }
      );
      console.log("✅ Gemini API Response:", result.data);
      return result.data;
    } catch (err) {
      const status = err.response?.status || 500;
      const data = err.response?.data;

      console.error(
        "❌ Error in getGeminiResponse:",
        status,
        data || err?.message || err
      );

      return {
        type: "error",
        response:
          data?.response ||
          "Sorry, I couldn't process that request. Please try again.",
        status: status,
      };
    }
  };

  // ---------------------
  // Load user on mount
  // ---------------------
  useEffect(() => {
    handleCurrentUser();
  }, []);

  // ---------------------
  // Context value
  // ---------------------
  const value = {
    serverUrl,
    userData,
    setUserData,
    handleCurrentUser, // optional: to refresh user data
    frontendImage,
    setFrontendImage,
    backendImage,
    setBackendImage,
    selectedImage,
    setSelectedImage,
    getGeminiResponse,
  };

  // ---------------------
  // Provider
  // ---------------------
  return (
    <userDataContext.Provider value={value}>
      {children}
    </userDataContext.Provider>
  );
}
