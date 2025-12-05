const jwt = require('jsonwebtoken');

exports.genToken = async (userId) => {
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined in environment variables");
        }

        const token = jwt.sign(
            { userId },
            process.env.JWT_SECRET,
            { expiresIn: "10d" }
        );

        return token;
    } catch (err) {
        console.log("JWT Error:", err);
        return null;
    }
};
