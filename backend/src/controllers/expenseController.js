const expenseService = require("../services/expenseService");
const asyncHandler = require("../utils/asyncHandler");

const create = asyncHandler(async (req, res) => {
  const expense = await expenseService.createExpense(req.user.id, req.body);

  res.status(201).json({
    expense
  });
});

const list = asyncHandler(async (req, res) => {
  const expenses = await expenseService.listExpenses(req.user.id, req.query);

  res.json({
    expenses
  });
});

const update = asyncHandler(async (req, res) => {
  const expense = await expenseService.updateExpense(req.user.id, req.params.id, req.body);

  res.json({
    expense
  });
});

const remove = asyncHandler(async (req, res) => {
  await expenseService.deleteExpense(req.user.id, req.params.id);

  res.status(204).send();
});

module.exports = {
  create,
  list,
  remove,
  update
};
