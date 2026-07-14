const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { verifyToken } = require("../utils/jwt");
const userRepository = require("../repositories/userRepository");

const authMiddleware = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Authentication token is required.", 401);
  }

  const token = authHeader.split(" ")[1];

  let payload;

  try {
    payload = verifyToken(token);
  } catch (_error) {
    throw new AppError("Invalid or expired token.", 401);
  }

  const user = await userRepository.findById(payload.sub);

  if (!user) {
    throw new AppError("Authenticated user was not found.", 401);
  }

  req.user = user;
  next();
});

module.exports = authMiddleware;
