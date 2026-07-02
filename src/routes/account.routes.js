const express = require("express")
const authMiddleware = require("../middleware/auth.middleware")
const accountController = require("../controllers/account.controller")

const router = express.Router()


router.post("/",authMiddleware.authMiddleware,accountController.createAccountController)
router.get("/get-all/transaction",authMiddleware.authMiddleware,accountController.getAccountController)
router.get("/balance/:accountId",authMiddleware.authMiddleware,accountController.getAccountBalanceController)

module.exports = router