const Pay = require("express").Router();

const {
  createSession,
  getOrderInfo,
  createCompany,
  getSessionInfo,
  updateTransaction,
} = require("../controllers_V1/Payment.controller.js");
const { isCustomer } = require("../middlewares/Customers/isCustomer");

const use = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/* Admin Auth */
Pay.post("/payment-url", use(isCustomer), use(createSession));
Pay.get("/payment-status/:orderID", use(isCustomer), use(getOrderInfo));
Pay.post("/gateway-hook", use(updateTransaction));
Pay.get("/session-info/:orderID", use(getSessionInfo));
Pay.post("/create-company", use(createCompany));

module.exports = Pay;
