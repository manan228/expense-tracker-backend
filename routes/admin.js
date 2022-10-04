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
router.post("/buy-premium", adminController.buyPremium);
router.delete("/delete-expense/:expenseId", adminController.deleteExpense);
router.get(
  "/set-premium/:orderId",
  userAuthentication.authenticate,
  adminController.setPremium
);
module.exports = router;
