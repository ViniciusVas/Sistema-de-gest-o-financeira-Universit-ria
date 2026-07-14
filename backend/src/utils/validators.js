const { ExpenseType, PaymentMethod } = require("@prisma/client");

const AppError = require("./AppError");
const { normalizeMoney } = require("./decimal");

function requiredString(value, fieldName) {
  if (typeof value !== "string" || !value.trim()) {
    throw new AppError(`${fieldName} is required.`);
  }

  return value.trim();
}

function optionalString(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return String(value).trim();
}

function positiveMoney(value, fieldName) {
  const normalized = normalizeMoney(value);

  if (normalized === null || normalized <= 0) {
    throw new AppError(`${fieldName} must be greater than zero.`);
  }

  return normalized;
}

function nonNegativeMoney(value, fieldName) {
  const normalized = normalizeMoney(value);

  if (normalized === null || normalized < 0) {
    throw new AppError(`${fieldName} must be zero or greater.`);
  }

  return normalized;
}

function requiredEmail(value) {
  const email = requiredString(value, "email").toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    throw new AppError("email must be valid.");
  }

  return email;
}

function requiredPassword(value) {
  const password = requiredString(value, "password");

  if (password.length < 6) {
    throw new AppError("password must have at least 6 characters.");
  }

  return password;
}

function requiredEnum(value, allowedValues, fieldName) {
  const normalized = requiredString(value, fieldName).toUpperCase();

  if (!allowedValues.includes(normalized)) {
    throw new AppError(`${fieldName} must be one of: ${allowedValues.join(", ")}.`);
  }

  return normalized;
}

function requiredExpenseType(value) {
  return requiredEnum(value, Object.values(ExpenseType), "expenseType");
}

function requiredPaymentMethod(value) {
  return requiredEnum(value, Object.values(PaymentMethod), "paymentMethod");
}

module.exports = {
  nonNegativeMoney,
  optionalString,
  positiveMoney,
  requiredEmail,
  requiredExpenseType,
  requiredPassword,
  requiredPaymentMethod,
  requiredString
};
