const jwt = require("jsonwebtoken");
const user = require("../models/user");
const redisclient = require("../config/redisdatabase");

const usermiddleware = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) throw new Error("Token is not present");

    const payload = jwt.verify(token, process.env.private_key);
    const { _id } = payload;
    if (!_id) throw new Error("Invalid token payload");

    // Optional: Populate problem_solved if needed
    const result = await user.findById(_id);
    if (!result) throw new Error("User doesn't exist");

    const isBlocked = await redisclient.exists(`token:${token}`);
    if (isBlocked) throw new Error("Token is expired or revoked");

    req.real_user = result;
    next();
  } catch (err) {
    console.error("Middleware Error:", err.message);
    res.status(401).json({ error: err.message });
  }
};

module.exports = usermiddleware;
