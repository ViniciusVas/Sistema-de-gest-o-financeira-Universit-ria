const monthlyGoalService = require("../services/monthlyGoalService");
const asyncHandler = require("../utils/asyncHandler");

const list = asyncHandler(async (req, res) => {
  const goals = await monthlyGoalService.listGoals(req.user.id, req.query);

  res.json({
    goals
  });
});

const save = asyncHandler(async (req, res) => {
  const goal = await monthlyGoalService.saveGoal(req.user.id, req.body);

  res.status(201).json({
    goal
  });
});

const update = asyncHandler(async (req, res) => {
  const goal = await monthlyGoalService.updateGoal(req.user.id, req.params.id, req.body);

  res.json({
    goal
  });
});

module.exports = {
  list,
  save,
  update
};
