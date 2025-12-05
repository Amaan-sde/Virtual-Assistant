import React from "react";
import { useState, useEffect, useRef } from "react";
import { userDataContext } from "../context/userDataContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ai from "../assets/AI.gif"
import userImg from "../assets/user.gif"
import { CgMenuRight } from "react-icons/cg";
import { RxCross2 } from "react-icons/rx";
import styles from "./Home.module.css";

export default function Home() {
  const { userData, setUserData, serverUrl, getGeminiResponse } =
    React.useContext(userDataContext);

  const navigate = useNavigate();

  const [listening, setListening] = useState(false);
  const [userText , setUserText] = useState("");
  const [aiText , setAiText] = useState("")
  const [ham , setHam] = useState(false);
  const recognitionRef = useRef(null);
  const isSpeakingRef = useRef(false);

  const synth = window.speechSynthesis;

  // ------------------------- LOGOUT ------------------------
  const handleLogout = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/auth/logout`, {
        withCredentials: true,
      });

      setUserData(null);
      navigate("/signin");
    } catch (err) {
      setUserData(null);
      console.log("Error during logout:", err);
    }
  };

  // ------------------------- SPEAK ------------------------
  const speak = (text) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "hi-IN";

    const voices = window.speechSynthesis.getVoices();
    const hindi = voices.find((v) => v.lang === "hi-IN");

    if (hindi) utter.voice = hindi;

    isSpeakingRef.current = true;

    utter.onend = () => {
      isSpeakingRef.current = false;
      startSafeRecognition();
    };

    synth.speak(utter);
  };

  // ---------------------- HANDLE COMMAND -------------------
  const handleCommand = (data) => {
    if (!data || !data.type) {
      console.error("Invalid command data:", data);
      return;
    }
    
    const { type, userInput, response } = data;

    console.log("Processing command:", { type, userInput, response });
    
    speak(response);

    if (type === "google_search") {
      console.log("Opening Google search:", userInput);
      window.open(`https://www.google.com/search?q=${encodeURIComponent(userInput)}`);
    }

    if (type === "calculator_open") {
      console.log("Opening calculator");
      window.open("https://www.google.com/search?q=calculator");
    }

    if (type === "instagram_open") {
      console.log("Opening Instagram");
      window.open("https://www.instagram.com/");
    }

    if (type === "facebook_open") {
      console.log("Opening Facebook");
      window.open("https://www.facebook.com/");
    }

    if (type === "weather-show") {
      console.log("Opening weather");
      window.open("https://www.google.com/search?q=weather");
    }

    if (type === "youtube_search" || type === "youtube_play") {
      console.log("Opening YouTube:", userInput);
      const q = encodeURIComponent(userInput);
      window.open(`https://www.youtube.com/results?search_query=${q}`);
    }
  };

  // ---------------------- SAFE START FUNCTION ---------------
  const startSafeRecognition = () => {
    let rec = recognitionRef.current;
    if (!rec) return;

    if (!isSpeakingRef.current && !rec._listening) {
      try {
        rec.start();
      } catch (e) {
        if (e.name !== "InvalidStateError") {
          console.log("Start error:", e);
        }
      }
    }
  };

  // ---------------------- INIT RECOGNITION ------------------
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("Speech Recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";

    // Custom flag to avoid two states
    recognition._listening = false;

    recognitionRef.current = recognition;

    // When recognition starts
    recognition.onstart = () => {
      recognition._listening = true;
      setListening(true);
    };

    // When recognition stops
    recognition.onend = () => {
      recognition._listening = false;
      setListening(false);

      // Auto-restart recognition to keep mic always on
      console.log("Recognition ended, restarting...");
      if (!isSpeakingRef.current) {
        setTimeout(startSafeRecognition, 100);
      }
    };

    // When there is an error
    recognition.onerror = (event) => {
      // no-speech and aborted are transient; just restart
      if (event.error !== "aborted" && event.error !== "no-speech") {
        console.log("Recognition error:", event.error);
      }

      recognition._listening = false;
      setListening(false);

      // Always restart on error to keep mic always on
      console.log("Error occurred, restarting recognition...");
      if (!isSpeakingRef.current) {
        setTimeout(startSafeRecognition, 100);
      }
    };

    // When speech is heard
    recognition.onresult = async (e) => {
      const transcript =
        e.results[e.results.length - 1][0].transcript.trim().toLowerCase();


      console.log("Heard:", transcript);

      // Wake word - assistant name
      if (
        userData?.assistantName &&
        transcript.includes(userData.assistantName.toLowerCase())
      ) {
        setAiText("");
        setUserText(transcript)

        const data = await getGeminiResponse(transcript);
        
        // Debug log - FULL DATA INSPECTION
        console.log("=== GEMINI RESPONSE DEBUG ===");
        console.log("Full response data:", JSON.stringify(data, null, 2));
        console.log("Response type:", data?.type);
        console.log("Response status:", data?.status);
        console.log("=== END DEBUG ===");
        
        if (data && (data.type === "error" || data.status === 429 || data.status === 503)) {
          // Handle error response
          console.log("Detected error response, speaking:", data.response);
          speak(data.response);
          setAiText(data.response);
        } else if (data && data.type && data.type !== "error") {
          // Handle normal response (make sure it's not an error type)
          console.log("Detected valid command type:", data.type);
          handleCommand(data);
          setAiText(data.response);
        } else {
          console.error("Invalid response from Gemini:", data);
          speak("Sorry, I couldn't process that");
          setAiText("Error processing command");
        }
        setUserText("")
      }
    };

    // Start listening safely one time
    startSafeRecognition();

    return () => {
      recognition.stop();
      recognition._listening = false;
    };
  }, []);

  // ---------------------- UI -------------------------------
  return (
    <div className={styles.container}>
      <CgMenuRight className={styles.menuIcon} onClick={() => setHam(true)} />
      
      <div className={`${styles.menuPanel} ${ham ? styles.active : styles.inactive}`}>
        <RxCross2 className={styles.closeBtn} onClick={() => setHam(false)} />
        
        <button className={styles.logoutBtnMobile} onClick={handleLogout}>
          Log Out
        </button>

        <button className={styles.customizeBtnMobile} onClick={() => navigate("/customize")}>
          Customize Your Assistant
        </button>

        <div className={styles.historyContainer}>
          <h1 className={styles.historyTitle}>History</h1>
          <div className={styles.historyList}>
            {userData?.history && userData.history.length > 0 ? (
              userData.history.map((his, idx) => (
                <span key={idx} className={styles.historyItem}>{his}</span>
              ))
            ) : (
              <span className={styles.historyEmpty}>No history yet</span>
            )}
          </div>
        </div>
      </div>

      <button className={styles.logoutBtnDesktop} onClick={handleLogout}>
        Log Out
      </button>

      <button className={styles.customizeBtnDesktop} onClick={() => navigate("/customize")}>
        Customize Your Assistant
      </button>

      <div className={styles.assistantImage}>
        <img src={userData?.assistantImage} alt="Assistant" />
      </div>

      <h1 className={styles.welcomeText}>
        Welcome to your Assistant,{" "}
        <span className={styles.assistantName}>
          {userData?.assistantName || "Your Assistant"}
        </span>
      </h1>
     {!aiText && <img src={userImg} alt="" className="w-[200px]" /> }
     {aiText && <img src={ai} alt="" className="w-[200px]" /> }

     <h1 className="text-white text-[18px] font-semibold text-wrap">{userText?userText: aiText ? aiText: null}</h1>

     
    </div>
  );
}
