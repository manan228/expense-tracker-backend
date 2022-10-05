const express = require("express");

const adminController = require("../controller/admin");
const userAuthentication = require("../middleware/auth");

const router = express.Router();

router.get(
  "/get-expenses",
  userAuthentication.authenticate,
  adminController.getExpenses
);
router.get(
  "/get-expenses/:userEmail",
  // userAuthentication.authenticate,
  adminController.getExpensesPremium
);
router.post("/add-user", adminController.postUser);
router.post("/login", adminController.postLogin);
router.post(
  "/add-expense",
  userAuthentication.authenticate,
  adminController.postAddExpense
);
router.post("/buy-premium", adminController.buyPremium);
router.delete("/delete-expense/:expenseId", adminController.deleteExpense);
router.get(
  "/set-premium/:orderId",
  userAuthentication.authenticate,
  adminController.setPremium
);
router.get("/all-users", adminController.fetchAllUsers);
router.post("/password/forgotpassword", adminController.forgotPassword);

module.exports = router;
