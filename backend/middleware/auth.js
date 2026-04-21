import User from "../models/user.model.js";

const authMiddleware = async (req, res, next) => {
  try {
    // Token can come from header OR query OR body — handle all cases
    const token =
      req.headers.authorization ||
      req.query.token ||
      req.body.token;

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Find user by token exactly like your other controllers do
    const user = await User.findOne({ token });

    if (!user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Attach user to request so controller can use req.user
    req.user = user;
    next();

  } catch (error) {
    return res.status(500).json({ error: "Auth failed" });
  }
};

export default authMiddleware;

// for chatbot not from starting 