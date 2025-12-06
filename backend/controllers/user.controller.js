const { uploadOnCloudinary } = require("../config/cloudinary");
const { geminiResponse } = require("../gemini");
const User = require("../models/user.model");
const moment = require('moment');

// ---------------- GET USER ----------------
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ user });

  } catch (err) {
    console.error("Error fetching user:", err);
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
    await user.save();

    const userName = user.name;
    const assistantName = user.assistantName;

    const result = await geminiResponse(command, assistantName, userName);

    const resultText = typeof result === "string" ? result : JSON.stringify(result);

    const jsonMatch = resultText.match(/{[\s\S]*}/);

    if (!jsonMatch) {
      return res.status(400).json({
        type: "error",
        response: "Sorry, I can't understand.",
      });
    }

    const gemResult = JSON.parse(jsonMatch[0]);
    const type = gemResult.type;
    const userInput = gemResult.userInput || command;

    switch (type) {
      case 'get_date':
        return res.json({ type, userInput, response: moment().format("YYYY-MM-DD") });

      case 'get_time':
        return res.json({ type, userInput, response: moment().format("HH:mm:ss") });

      case 'get_day':
        return res.json({ type, userInput, response: moment().format("dddd") });

      case 'get_month':
        return res.json({ type, userInput, response: moment().format("MMMM") });

      default:
        return res.json({ type, userInput, response: gemResult.response });
    }

  } catch (err) {
    console.error("Error in askToAssistant:", err);
    return res.status(500).json({
      type: "error",
      response: "Sorry, something went wrong. Please try again."
    });
  }
};
