const mongoose = require("mongoose");
const { Schema } = mongoose;

const Transaction = new Schema({
  id: { type: String, require: true, index: { unique: true } },
  sessionId: { type: String, require: true },
  orderId: { type: String, require: true },
  returnUrl: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now() },
  companyId: { type: String, default: "", required: true },
  Details: { type: {}, default: {} },
});

const TransactionModel = mongoose.model("Transaction", Transaction);
module.exports = TransactionModel;
