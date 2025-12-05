import React, { useState, useContext } from "react";
import bg from "../assets/authBg.png";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { userDataContext } from "../context/userDataContext";
import axios from "axios";

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const { serverUrl, setUserData } = useContext(userDataContext);
  const Navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${serverUrl}/api/auth/signin`,
        { email, password },
        { withCredentials: true }
      );

      const user = response.data?.user ?? response.data;
      setUserData(user);
      setLoading(false);
      
      // Redirect based on whether assistant is customized
      if (user?.assistantName && user?.assistantImage) {
        Navigate("/");
      } else {
        Navigate("/customize");
      }

      console.log("Sign in successful:", response.data);
    } catch (error) {
      console.log("Error during sign in:", error);

      setUserData(null);
      setLoading(false);

      if (error.response?.data?.message) {
        setErr(error.response.data.message);
      } else {
        setErr("Invalid credentials. Please try again!");
      }
    }
  };

  return (
    <div
      className="w-full h-[100vh] bg-cover flex justify-center items-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <form
        className="w-[90%] h-[600px] max-w-[500px] bg-[#00000062] backdrop-blur shadow-lg shadow-black flex flex-col items-center justify-center gap-[20px] px-[20px]"
        onSubmit={handleSignIn}
      >
        <h1 className="text-white text-[30px] font-semibold mb-[30px]">
          Sign In To <span className="text-blue-400">Virtual Assistant</span>
        </h1>

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          className="w-full h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] rounded-full text-[18px]"
          required
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />

        {/* Password */}
        <div className="w-full h-[60px] border-2 border-white bg-transparent text-white rounded-full text-[18px] relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full h-full rounded-full outline-none bg-transparent placeholder-gray-300 px-[20px]"
            required
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />

          {!showPassword ? (
            <IoEye
              className="absolute top-[18px] right-[20px] w-[25px] h-[25px] text-white cursor-pointer"
              onClick={() => setShowPassword(true)}
            />
          ) : (
            <IoEyeOff
              className="absolute top-[18px] right-[20px] w-[25px] h-[25px] text-white cursor-pointer"
              onClick={() => setShowPassword(false)}
            />
          )}
        </div>

        {/* Error */}
        {err && <p className="text-red-500 text-[17px]">*{err}</p>}

        {/* Button */}
        <button
          className="min-w-[150px] h-[60px] bg-white rounded-full text-black font-semibold text-[19px] mt-[30px]"
          disabled={loading}
        >
          {loading ? "Loading..." : "Sign In"}
        </button>

        {/* Navigation */}
        <p
          className="text-white text-[18px] cursor-pointer"
          onClick={() => Navigate("/signup")}
        >
          Want to create a new account?{" "}
          <span className="text-blue-400">Sign Up</span>
        </p>
      </form>
    </div>
  );
}
