// src/context/UserContext.jsx

import { useEffect, useState } from "react";
import axios from "axios";

import { userDataContext } from './userDataContext';

export default function UserContext({ children }) {
  const serverUrl = "https://virtual-assistant-backend-23w4.onrender.com";
  const [userData, setUserData] = useState(null);
  const [frontendImage , setFrontendImage] = useState(null);
  const [backendImage , setBackendImage] = useState(null);
  const [selectedImage , setSelectedImage] = useState(null);

  const handleCurrentUser = async () => {
    try {
      const response = await axios.get(
        `${serverUrl}/api/user/current`,
        { withCredentials: true }
      );
      setUserData(response.data.user);
    } catch (err) {
      console.log("Error fetching current user:", err);
    }
  };

  const getGeminiResponse = async (command)=>{
    try{
      const result = await axios.post(
        `${serverUrl}/api/user/asktoassistant`,
        { command },
        { withCredentials: true }
      );
      console.log("✅ Gemini API Response:", result.data);
      return result.data;
    }
    catch(err){
      const status = err.response?.status;
      const data = err.response?.data;
      
      console.error('❌ Error in getGeminiResponse:', status, data || err?.message || err);
      
      // Return error response with type and message for frontend to handle
      return {
        type: "error",
        response: data?.response || "Sorry, I couldn't process that request. Please try again.",
        status: status
      };
    }
  }

  useEffect(() => {
    handleCurrentUser();
  }, []);

  const value = {
    serverUrl,
    userData,
    setUserData,
    backendImage , setBackendImage,
    frontendImage , setFrontendImage,
    selectedImage , setSelectedImage,
    getGeminiResponse,

  };



  return (
    <userDataContext.Provider value={value}>
      {children}
    </userDataContext.Provider>
  );
}
