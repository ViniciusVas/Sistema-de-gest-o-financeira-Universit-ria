const authService = require("../services/authService");
const asyncHandler = require("../utils/asyncHandler");

const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);

  res.status(201).json({
    user
  });
});

const login = asyncHandler(async (req, res) => {
  const session = await authService.login(req.body);

  res.json(session);
});

const me = asyncHandler(async (req, res) => {
  res.json({
    user: req.user
  });
});

module.exports = {
  login,
  me,
  register
};
