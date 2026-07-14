const bcrypt = require("bcrypt");

const AppError = require("../utils/AppError");
const { signToken } = require("../utils/jwt");
const {
  requiredEmail,
  requiredPassword,
  requiredString
} = require("../utils/validators");
const userRepository = require("../repositories/userRepository");

const SALT_ROUNDS = 10;

async function register(payload) {
  const name = requiredString(payload.name, "name");
  const email = requiredEmail(payload.email);
  const password = requiredPassword(payload.password);

  const emailAlreadyUsed = await userRepository.findByEmail(email);

  if (emailAlreadyUsed) {
    throw new AppError("Email is already registered.", 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  return userRepository.create({
    name,
    email,
    passwordHash
  });
}

async function login(payload) {
  const email = requiredEmail(payload.email);
  const password = requiredString(payload.password, "password");

  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    throw new AppError("Invalid email or password.", 401);
  }

  const token = signToken(user.id);

  return {
    token,
    user: userRepository.sanitizeUser(user)
  };
}

module.exports = {
  login,
  register
};
