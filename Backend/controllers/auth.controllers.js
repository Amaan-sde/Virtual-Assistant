const User = require('../models/user.model');
const { genToken } = require('../config/token');
const bcrypt = require('bcryptjs');

exports.signUp = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, Email and Password are required" });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({ message: "User with this email already exists" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashPassword
        });

        await newUser.save();

   
        const token = await genToken(newUser._id);

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: "strict",
            secure: false
        });

        return res.status(201).json({ message: "User registered successfully" });

    } catch (err) {
        console.error("Error in user registration:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.signIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Fill all the details" });
        }

        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({ message: "User not registered yet!" });
        }

        const checkPassword = await bcrypt.compare(password, existingUser.password);

        if (!checkPassword) {
            return res.status(400).json({ message: "Incorrect password" });
        }

        // generate token and set cookie
        const token = await genToken(existingUser._id);

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: "strict",
            secure: false
        });

        // return the user (without password) so frontend can update context
        const userObj = existingUser.toObject ? existingUser.toObject() : existingUser;
        if (userObj.password) delete userObj.password;

        return res.status(200).json({ user: userObj });

    } catch (err) {
        return res.status(500).json({ message: "Internal error during sign in" });
    }
};

exports.logout = async (req, res) => {
    try {
        res.clearCookie("token");
        return res.status(200).json({ message: "User logged out successfully" });
    } catch (err) {
        return res.status(500).json({ message: "Internal error during logout" });
    }
};
