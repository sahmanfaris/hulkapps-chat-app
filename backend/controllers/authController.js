const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const redisClient = require("../utils/redisClient.js");

export const register = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await redisClient.hGetAll(`user:${username}`);
    if (Object.keys(existingUser).length > 0) {
      console.log("User already exists");
      return res.status(400).json({ message: "Username already taken" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userId = Date.now().toString();

    const user = {
      id: userId,
      username,
      password: hashedPassword,
    };

    await redisClient.hSet(`user:${username}`, user);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Failed to register user" });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const userKeys = await redisClient.keys("user:*");
    for (const key of userKeys) {
      const user = await redisClient.hGetAll(key);
      if (Object.keys(user).length > 0 && user.username === username) {
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (isValidPassword) {
          const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            {
              expiresIn: "1h",
            }
          );
          return res.json({ token });
        }
      }
    }
    res.status(401).json({ message: "Invalid username or password" });
  } catch (error) {
    res.status(500).json({ message: "Failed to log in user" });
  }
};
