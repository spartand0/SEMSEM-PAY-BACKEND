const mongoose = require("mongoose");

const { Schema } = mongoose;

const Company = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true, default: "" },
  description: { type: String, default: "" },
  address: { type: String, required: true, default: "" },
  email: { type: String, required: true, default: "" },
  secret: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now() },
  type: { type: String, default: "" },
  matricule: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  isArchived: { type: Boolean, default: false },
  transactions: { type: Array, default: [] },
});

const CompanyModel = mongoose.model("Company", Company);
module.exports = CompanyModel;
