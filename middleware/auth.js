//middleware/auth.js
const jwt = require("jsonwebtoken");
const secret = process.env.SECRET;

const verifyToken = (req) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) throw new Error("Cannot find auth header");

  const splitToken = authHeader.split(" ");
  const tokenParts = splitToken[1];

  try {
    const decoded = jwt.verify(tokenParts, secret);
    return decoded;
  } catch (error) {
    throw new Error("Token invalid or expired");
  }
};

module.exports = verifyToken;
