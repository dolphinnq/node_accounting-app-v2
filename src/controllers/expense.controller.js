'use strict';

const expenseService = require('../services/expense.service');
const { getAll } = require('../services/user.service');

const get = (req, res) => {
  const allExpenses = expenseService.getAllExpenses();
  const { userId, categories, from, to } = req.query;
  let filteredExpenses = null;

  if (categories && userId) {
    filteredExpenses = allExpenses.filter(item => {
      return item.category === categories;
    });

    return res.send(filteredExpenses);
  };

  if (userId) {
    filteredExpenses = allExpenses.filter(item => {
      return item.userId === +userId;
    });

    return res.send(filteredExpenses);
  }

  if (allExpenses.length === 0) {
    return res.send([]);
  }

  if (from && to) {
    filteredExpenses = allExpenses.filter(item => {
      return item.spentAt > from && item.spentAt < to;
    });

    return res.send(filteredExpenses);
  }

  return res.send(allExpenses);
};

const getOne = (req, res) => {
  const { id } = req.params;

  const expense = expenseService.getExpenseById(id);

  if (!expense) {
    res.sendStatus(404);

    return;
  }

  return res.json(expense);
};

const post = (req, res) => {
  const {
    userId,
    spentAt,
    title,
    amount,
    category,
    note,
  } = req.body;

  const userToFind = getAll().find(user => user.id === +userId);

  if (!title || !userToFind) {
    res.sendStatus(400);

    return;
  }

  const newExpense = expenseService.createExpense({
    userId,
    spentAt,
    title,
    amount,
    category,
    note,
  });

  res.status(201).json(newExpense);
};

const update = (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  const expense = expenseService.getExpenseById(id);

  if (!expense) {
    res.sendStatus(404);

    return;
  }

  if (typeof title !== 'string') {
    res.sendStatus(422);

    return;
  }

  const updatedExpense = expenseService.updateExpense(title, expense);

  res.send(updatedExpense);
};

const remove = (req, res) => {
  const { id } = req.params;

  const newExpenses = expenseService.deleteExpense(id);

  if (newExpenses.length === expenseService.getAllExpenses().length) {
    res.sendStatus(404);

    return;
  }

  expenseService.setExpenses(newExpenses);

  res.sendStatus(204);
};

module.exports = {
  get,
  getOne,
  post,
  update,
  remove,
};