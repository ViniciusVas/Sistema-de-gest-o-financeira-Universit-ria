const { decimalToNumber } = require("../utils/decimal");
const { parseMonthYear, validateMonthYear } = require("../utils/date");
const reportRepository = require("../repositories/reportRepository");

function roundMoney(value) {
  return Number(value.toFixed(2));
}

function parseYear(query) {
  if (!query.year) {
    return null;
  }

  const year = Number(query.year);
  validateMonthYear(1, year);

  return year;
}

function getMonthKeyFromDate(date) {
  const month = date.getUTCMonth() + 1;
  const year = date.getUTCFullYear();

  return getMonthKey(month, year);
}

function getMonthKey(month, year) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function createHistoryItem(month, year) {
  return {
    month,
    year,
    totalIncomes: 0,
    totalExpenses: 0,
    balance: 0,
    goal: null
  };
}

function getOrCreateItem(historyMap, month, year) {
  const key = getMonthKey(month, year);

  if (!historyMap.has(key)) {
    historyMap.set(key, createHistoryItem(month, year));
  }

  return historyMap.get(key);
}

function applyGoalStatus(item) {
  if (!item.goal) {
    return item;
  }

  const targetAmount = item.goal.targetAmount;
  const achieved = item.balance >= targetAmount;
  const missingAmount = achieved ? 0 : roundMoney(targetAmount - item.balance);
  const progressPercentage = targetAmount > 0
    ? roundMoney((item.balance / targetAmount) * 100)
    : 0;

  item.goal = {
    ...item.goal,
    achieved,
    missingAmount,
    progressPercentage
  };

  return item;
}

function calculateGoal(balance, monthlyGoal) {
  if (!monthlyGoal) {
    return null;
  }

  const targetAmount = decimalToNumber(monthlyGoal.targetAmount);
  const achieved = balance >= targetAmount;
  const missingAmount = achieved ? 0 : roundMoney(targetAmount - balance);
  const progressPercentage = targetAmount > 0
    ? roundMoney((balance / targetAmount) * 100)
    : 0;

  return {
    id: monthlyGoal.id,
    targetAmount,
    achieved,
    missingAmount,
    progressPercentage
  };
}

function buildCategorySummary(expenses) {
  const totalExpenses = expenses.reduce((sum, expense) => sum + decimalToNumber(expense.amount), 0);
  const grouped = new Map();

  for (const expense of expenses) {
    const amount = decimalToNumber(expense.amount);
    const current = grouped.get(expense.categoryId) || {
      categoryId: expense.categoryId,
      categoryName: expense.category?.name || "Sem categoria",
      total: 0,
      quantity: 0
    };

    current.total = roundMoney(current.total + amount);
    current.quantity += 1;
    grouped.set(expense.categoryId, current);
  }

  return Array.from(grouped.values())
    .map((item) => ({
      ...item,
      percentage: totalExpenses > 0 ? roundMoney((item.total / totalExpenses) * 100) : 0
    }))
    .sort((a, b) => b.total - a.total);
}

function buildLimitSummary(limits, expenses) {
  const spentByCategory = new Map();

  for (const expense of expenses) {
    const current = spentByCategory.get(expense.categoryId) || 0;
    spentByCategory.set(expense.categoryId, roundMoney(current + decimalToNumber(expense.amount)));
  }

  return limits
    .map((limit) => {
      const limitAmount = decimalToNumber(limit.limitAmount);
      const spentAmount = spentByCategory.get(limit.categoryId) || 0;
      const percentageUsed = limitAmount > 0 ? roundMoney((spentAmount / limitAmount) * 100) : 0;

      return {
        id: limit.id,
        categoryId: limit.categoryId,
        categoryName: limit.category?.name || "Sem categoria",
        limitAmount,
        spentAmount,
        percentageUsed,
        exceeded: percentageUsed >= 100
      };
    })
    .sort((a, b) => b.percentageUsed - a.percentageUsed);
}

function formatTransaction(transaction, type) {
  return {
    id: transaction.id,
    type,
    description: transaction.description,
    amount: decimalToNumber(transaction.amount),
    date: transaction.date,
    categoryName: transaction.category?.name || null,
    source: transaction.source || null,
    expenseType: transaction.expenseType || null,
    paymentMethod: transaction.paymentMethod || null,
    isRecurring: Boolean(transaction.isRecurring)
  };
}

async function getMonthlyHistory(userId, query) {
  const year = parseYear(query);
  const [incomes, expenses, goals] = await Promise.all([
    reportRepository.findIncomesForHistory(userId, year),
    reportRepository.findExpensesForHistory(userId, year),
    reportRepository.findGoalsForHistory(userId, year)
  ]);

  const historyMap = new Map();

  for (const income of incomes) {
    const key = getMonthKeyFromDate(income.date);
    const month = income.date.getUTCMonth() + 1;
    const incomeYear = income.date.getUTCFullYear();
    const item = getOrCreateItem(historyMap, month, incomeYear);

    item.totalIncomes = roundMoney(item.totalIncomes + decimalToNumber(income.amount));
  }

  for (const expense of expenses) {
    const key = getMonthKeyFromDate(expense.date);
    const month = expense.date.getUTCMonth() + 1;
    const expenseYear = expense.date.getUTCFullYear();
    const item = getOrCreateItem(historyMap, month, expenseYear);

    item.totalExpenses = roundMoney(item.totalExpenses + decimalToNumber(expense.amount));
  }

  for (const goal of goals) {
    const item = getOrCreateItem(historyMap, goal.month, goal.year);

    item.goal = {
      targetAmount: decimalToNumber(goal.targetAmount)
    };
  }

  const history = Array.from(historyMap.values())
    .map((item) => {
      item.balance = roundMoney(item.totalIncomes - item.totalExpenses);
      return applyGoalStatus(item);
    })
    .sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year;
      }

      return b.month - a.month;
    });

  return {
    year,
    history
  };
}

async function getMonthlyReport(userId, query) {
  const { month, year } = parseMonthYear(query);
  const [incomes, expenses, monthlyGoal, limits] = await Promise.all([
    reportRepository.findMonthlyIncomes(userId, month, year),
    reportRepository.findMonthlyExpenses(userId, month, year),
    reportRepository.findMonthlyGoal(userId, month, year),
    reportRepository.findMonthlyLimits(userId, month, year)
  ]);

  const totalIncomes = roundMoney(incomes.reduce((sum, income) => sum + decimalToNumber(income.amount), 0));
  const totalExpenses = roundMoney(expenses.reduce((sum, expense) => sum + decimalToNumber(expense.amount), 0));
  const fixedExpenses = roundMoney(expenses
    .filter((expense) => expense.expenseType === "FIXED")
    .reduce((sum, expense) => sum + decimalToNumber(expense.amount), 0));
  const variableExpenses = roundMoney(expenses
    .filter((expense) => expense.expenseType === "VARIABLE")
    .reduce((sum, expense) => sum + decimalToNumber(expense.amount), 0));
  const balance = roundMoney(totalIncomes - totalExpenses);
  const categories = buildCategorySummary(expenses);
  const limitsSummary = buildLimitSummary(limits, expenses);

  return {
    month,
    year,
    totals: {
      totalIncomes,
      totalExpenses,
      balance,
      fixedExpenses,
      variableExpenses
    },
    goal: calculateGoal(balance, monthlyGoal),
    categories,
    topCategories: categories.slice(0, 5),
    exceededLimits: limitsSummary.filter((limit) => limit.exceeded),
    limits: limitsSummary,
    transactions: [
      ...incomes.map((income) => formatTransaction(income, "income")),
      ...expenses.map((expense) => formatTransaction(expense, "expense"))
    ].sort((a, b) => new Date(a.date) - new Date(b.date))
  };
}

function escapeCsv(value) {
  if (value === null || value === undefined) {
    return "";
  }

  const text = String(value).replace(/"/g, '""');

  if (/[",\n;]/.test(text)) {
    return `"${text}"`;
  }

  return text;
}

function toCsvLine(values) {
  return values.map(escapeCsv).join(";");
}

function buildMonthlyReportCsv(report) {
  const rows = [
    ["Relatório mensal"],
    ["Mês", report.month],
    ["Ano", report.year],
    [],
    ["Resumo"],
    ["Total de receitas", report.totals.totalIncomes],
    ["Total de despesas", report.totals.totalExpenses],
    ["Saldo", report.totals.balance],
    ["Despesas fixas", report.totals.fixedExpenses],
    ["Despesas variáveis", report.totals.variableExpenses],
    ["Meta", report.goal?.targetAmount ?? ""],
    ["Meta atingida", report.goal ? (report.goal.achieved ? "Sim" : "Não") : ""],
    ["Falta para a meta", report.goal?.missingAmount ?? ""],
    [],
    ["Gastos por categoria"],
    ["Categoria", "Total", "Percentual", "Quantidade"],
    ...report.categories.map((category) => [
      category.categoryName,
      category.total,
      `${category.percentage}%`,
      category.quantity
    ]),
    [],
    ["Limites ultrapassados"],
    ["Categoria", "Limite", "Gasto", "Percentual usado"],
    ...report.exceededLimits.map((limit) => [
      limit.categoryName,
      limit.limitAmount,
      limit.spentAmount,
      `${limit.percentageUsed}%`
    ]),
    [],
    ["Movimentações"],
    ["Tipo", "Descrição", "Valor", "Data", "Categoria/Origem", "Tipo da despesa", "Forma de pagamento"],
    ...report.transactions.map((transaction) => [
      transaction.type === "income" ? "Receita" : "Despesa",
      transaction.description,
      transaction.amount,
      transaction.date.toISOString().slice(0, 10),
      transaction.categoryName || transaction.source || "",
      transaction.expenseType || "",
      transaction.paymentMethod || ""
    ])
  ];

  return rows.map(toCsvLine).join("\n");
}

module.exports = {
  buildMonthlyReportCsv,
  getMonthlyHistory,
  getMonthlyReport
};
