const { decimalToNumber, normalizeMoney } = require("../utils/decimal");
const { optionalString } = require("../utils/validators");
const { parseDate } = require("../utils/date");
const AppError = require("../utils/AppError");
const financialProfileRepository = require("../repositories/financialProfileRepository");

function formatProfile(profile) {
  if (!profile) {
    return null;
  }

  return {
    ...profile,
    estimatedMonthlyIncome:
      profile.estimatedMonthlyIncome === null ? null : decimalToNumber(profile.estimatedMonthlyIncome),
    defaultSavingGoal:
      profile.defaultSavingGoal === null ? null : decimalToNumber(profile.defaultSavingGoal)
  };
}

function optionalMoney(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const normalized = normalizeMoney(value);

  if (normalized === null || normalized < 0) {
    throw new AppError(`${fieldName} deve ser maior ou igual a zero.`);
  }

  return normalized;
}

function optionalDate(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return parseDate(value, fieldName);
}

function buildProfileData(payload) {
  return {
    incomeType: optionalString(payload.incomeType),
    estimatedMonthlyIncome: optionalMoney(payload.estimatedMonthlyIncome, "Renda mensal estimada"),
    financialGoal: optionalString(payload.financialGoal),
    defaultSavingGoal: optionalMoney(payload.defaultSavingGoal, "Meta padrão de economia"),
    fixedExpensesNotes: optionalString(payload.fixedExpensesNotes),
    university: optionalString(payload.university),
    course: optionalString(payload.course),
    expectedGraduation: optionalDate(payload.expectedGraduation, "Previsão de término")
  };
}

async function getProfile(userId) {
  const profile = await financialProfileRepository.findByUserId(userId);

  return formatProfile(profile);
}

async function saveProfile(userId, payload) {
  const data = buildProfileData(payload);
  const profile = await financialProfileRepository.upsertByUserId(userId, data);

  return formatProfile(profile);
}

module.exports = {
  getProfile,
  saveProfile
};
