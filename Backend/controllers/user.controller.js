const { uploadOnCloudinary } = require("../config/cloudinary");
const { geminiResponse } = require("../gemini");
const User = require("../models/user.model");
const moment = require('moment');

// ---------------- GET USER ----------------
exports.getUser = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ user });
    } catch (err) {
        console.error("Error fetching user data:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


// ---------------- UPDATE ASSISTANT ----------------
exports.updateAssistant = async (req, res) => {
    try {
        const { assistantName, imageUrl } = req.body;
        let assistantImage;

        if (req.file) {
            assistantImage = await uploadOnCloudinary(req.file.path);
        } else {
            assistantImage = imageUrl;
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            { assistantName, assistantImage },
            { new: true }
        ).select('-password');

        return res.status(200).json({ user });

    } catch (err) {
        console.error("Error updating assistant:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


// ---------------- ASK ASSISTANT ----------------
exports.askToAssistant = async (req, res) => {
    try {
        const { command } = req.body;

        const user = await User.findById(req.userId);
        user.history.push(command);
        user.save();

        const userName = user.name; // ✅ FIXED
        const assistantName = user.assistantName;

        // Await Gemini response
        const result = await geminiResponse(command, assistantName, userName);

        console.log("Gemini raw result:", result);

        const resultText =
            typeof result === "string" ? result : JSON.stringify(result);

        console.log("Result text to parse:", resultText);

        const jsonMatch = resultText.match(/{[\s\S]*}/);

        if (!jsonMatch) {
            console.error("No JSON found in response. Full result:", resultText);
            return res.status(400).json({
                type: "error",
                response: "Sorry, I can't understand.",
            });
        }

        console.log("Extracted JSON:", jsonMatch[0]);
        
        const gemResult = JSON.parse(jsonMatch[0]);
        const type = gemResult.type;
        const userInput = gemResult.userInput || command; // Fallback to command if userInput missing

        console.log("Parsed type:", type, "User Input:", userInput);

        switch (type) {
            case 'get_date':
                return res.json({
                    type,
                    userInput,
                    response: `Current date is ${moment().format("YYYY-MM-DD")}`
                });

            case 'get_time':
                return res.json({
                    type,
                    userInput,
                    response: `Current time is ${moment().format("HH:mm:ss")}`
                });

            case 'get_day':
                return res.json({
                    type,
                    userInput,
                    response: `Today is ${moment().format("dddd")}`
                });

            case 'get_month':
                return res.json({
                    type,
                    userInput,
                    response: `Current month is ${moment().format("MMMM")}`
                });

                case 'google_search':
                case 'youtube_search': 
                case 'youtube_play': 
                case 'general':
                case 'calculator_open':
                case 'instagram_open': 
                case 'facebook_open': 
                case 'weather-show':
                    return res.json({ 
                        type, 
                        userInput, 
                        response: gemResult.response 
                    });

            default:
                return res.json({
                    type,
                    userInput,
                    response: gemResult.response
                });
        }
        

    } catch (err) {
        console.error("Error in askToAssistant:", err.message);
        
        // Check if it's a Gemini API rate limit error
        if (err.message.includes("Resource exhausted") || err.message.includes("429")) {
            return res.status(429).json({
                type: "error",
                response: "I'm getting too many requests right now. Please wait a moment and try again."
            });
        }
        
        // Check for other Gemini API errors
        if (err.message.includes("Gemini API Error")) {
            return res.status(503).json({
                type: "error",
                response: "The AI service is temporarily unavailable. Please try again in a moment."
            });
        }
        
        return res.status(500).json({
            type: "error",
            response: "Sorry, something went wrong. Please try again."
        });
    }
};
