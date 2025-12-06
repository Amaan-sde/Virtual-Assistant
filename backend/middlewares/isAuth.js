const jwt = require('jsonwebtoken');

exports.isAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.id;
    next();

  } catch (err) {
    console.log("Auth Error:", err);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
