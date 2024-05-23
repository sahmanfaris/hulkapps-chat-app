const jwt = require("jsonwebtoken");

const authMiddleware = (socket, next) => {
  const token = socket.handshake.query.token;
  if (!token) {
    return next(new Error("Invalid token"));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return next(new Error("Invalid token"));
    }
    socket.user = user;
    next();
  });
};

export default authMiddleware;
