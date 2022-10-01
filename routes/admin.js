const express = require("express");

const adminController = require("../controller/admin");

const router = express.Router();

router.post("/add-user", adminController.postUser);
router.post("/login", adminController.postLogin);
router.post("/add-expense", adminController.postAddExpense);
router.get("/get-expenses", adminController.getExpenses);
router.delete("/delete-expense/:expenseId", adminController.deleteExpense)

module.exports = router;
