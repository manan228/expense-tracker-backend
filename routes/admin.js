const express = require("express");

const adminController = require("../controller/admin");
const userAuthentication = require("../middleware/auth");

const router = express.Router();

router.get(
  "/get-expenses",
  userAuthentication.authenticate,
  adminController.getExpenses
);
router.post("/add-user", adminController.postUser);
router.post("/login", adminController.postLogin);
router.post(
  "/add-expense",
  userAuthentication.authenticate,
  adminController.postAddExpense
);
// router.get(
//   "/get-expenses",
//   userAuthentication.authenticate,
//   adminController.getExpenses
// );
router.delete("/delete-expense/:expenseId", adminController.deleteExpense);

module.exports = router;
