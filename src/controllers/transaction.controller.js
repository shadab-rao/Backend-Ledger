const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const emailService = require("../services/sendMail");
const accountModel = require("../models/account.model");
const mongoose = require("mongoose");

async function createTransactionController(req, res) {
  // Validate request body
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "fromAccount, toAccount, amount and idempotencyKey are required",
    });
  }

  const fromUserAccount = await accountModel.findOne({ _id: fromAccount });
  const toUserAccount = await accountModel.findOne({ _id: toAccount });

  if (!fromUserAccount || !toUserAccount) {
    return res.status(404).json({
      message: "fromAccount or toAccount not found",
    });
  }

  // Check if transaction with the same idempotency key already exists
  const isTransactionExist = await transactionModel.findOne({
    idempotencyKey,
  });

  if (isTransactionExist) {
    if (isTransactionExist.status === "Completed") {
      return res.status(200).json({
        message: "Transaction already completed",
        transaction: isTransactionExist,
      });
    }

    if (isTransactionExist.status === "Pending") {
      return res.status(200).json({
        message: "Transaction is still pending",
      });
    }

    if (isTransactionExist.status === "Failed") {
      return res.status(500).json({
        message: "Transaction has failed",
      });
    }

    if (isTransactionExist.status === "Reversed") {
      return res.status(500).json({
        message: "Transaction has been reversed, please try again",
      });
    }
  }

  // check account status

  if (
    fromUserAccount.status !== "Active" ||
    toUserAccount.status !== "Active"
  ) {
    return res.status(400).json({
      message: "Both fromAccount and toAccount must be active",
    });
  }

  // Check if fromAccount has sufficient balance
  if (fromUserAccount.balance < amount) {
    return res.status(400).json({
      message: "Insufficient balance in fromAccount",
    });
  }

  const balance = await fromUserAccount.getBalance();
  if (balance < amount) {
    return res.status(400).json({
      message: `Insufficient balance in fromAccount Current balance: ${balance},Required balance: ${amount}`,
    });
  }

  // Create a new transaction
  const session = await mongoose.startSession();
  session.startTransaction();
  const transaction = (
    await transactionModel.create(
      [
        {
          fromAccount,
          toAccount,
          amount,
          idempotencyKey,
          status: "Pending",
        },
      ],
      { session },
    )
  )[0];

  const debitLedgerEntry = await ledgerModel.create(
    [
      {
        account: fromAccount,
        type: "Debit",
        amount: amount,
        transaction: transaction._id,
      },
    ],
    { session },
  );

  const creditLedgerEntry = await ledgerModel.create(
    [
      {
        account: toAccount,
        type: "Credit",
        amount: amount,
        transaction: transaction._id,
      },
    ],
    { session },
  );

  await transactionModel.findByIdAndUpdate(
    { _id: transaction._id },
    { status: "Completed" },
    { session },
  );
  await session.commitTransaction();
  session.endSession();
}

async function createInitialFundsTransaction(req, res) {
  const { toAccount, amount, idempotencyKey } = req.body;
  if (!toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "toAccount, amount and idempotencyKey are required",
    });
  }
  const toUserAccount = await accountModel.findOne({ _id: toAccount });

  if (!toUserAccount) {
    return res.status(404).json({
      message: "toAccount not found",
    });
  }

  const fromUserAccount = await accountModel.findOne({
    user: req.user._id,
  });

  if (!fromUserAccount) {
    return res.status(404).json({
      message: "System account not found",
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  const transaction = new transactionModel({
    fromAccount: fromUserAccount._id,
    toAccount,
    amount,
    idempotencyKey,
    status: "Pending",
  });

  const debitLedgerEntry = await ledgerModel.create(
    [
      {
        account: fromUserAccount._id,
        type: "Debit",
        amount: amount,
        transaction: transaction._id,
      },
    ],
    { session },
  );

  const creditLedgerEntry = await ledgerModel.create(
    [
      {
        account: toAccount,
        type: "Credit",
        amount: amount,
        transaction: transaction._id,
      },
    ],
    { session },
  );

  transaction.status = "Completed";
  await transaction.save({ session });
  await session.commitTransaction();
  session.endSession();

  res.status(201).json({
    message: "Initial funds transaction created successfully",
    transaction: transaction,
  });
}

module.exports = { createTransactionController, createInitialFundsTransaction };
