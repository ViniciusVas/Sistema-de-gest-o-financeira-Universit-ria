require("dotenv").config();

const env = {
  port: Number(process.env.PORT || 3333),
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d"
};

if (!env.jwtSecret) {
  throw new Error("JWT_SECRET is required in the .env file.");
}

module.exports = {
  env
};
