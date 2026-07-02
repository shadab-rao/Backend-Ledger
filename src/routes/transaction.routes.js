const {Router} = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const { createTransactionController,createInitialFundsTransaction } = require('../controllers/transaction.controller');

const transactionRoutes = Router();

transactionRoutes.post('/', authMiddleware.authMiddleware, createTransactionController);

transactionRoutes.post("/system/initial-funds", authMiddleware.authSystemMiddlware, createInitialFundsTransaction);

module.exports = transactionRoutes;