const incomeService = require("../services/incomeService");
const asyncHandler = require("../utils/asyncHandler");

const create = asyncHandler(async (req, res) => {
  const income = await incomeService.createIncome(req.user.id, req.body);

  res.status(201).json({
    income
  });
});

const list = asyncHandler(async (req, res) => {
  const incomes = await incomeService.listIncomes(req.user.id, req.query);

  res.json({
    incomes
  });
});

const update = asyncHandler(async (req, res) => {
  const income = await incomeService.updateIncome(req.user.id, req.params.id, req.body);

  res.json({
    income
  });
});

const remove = asyncHandler(async (req, res) => {
  await incomeService.deleteIncome(req.user.id, req.params.id);

  res.status(204).send();
});

module.exports = {
  create,
  list,
  remove,
  update
};
