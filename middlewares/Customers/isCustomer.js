const jwt = require("jsonwebtoken");
const CompanyModel = require("../../models/Company/Company");

exports.isCustomer = async (req, res, next) => {
  const token = req.headers["x-pay-token"];
  const companyId = req.headers["x-pay-id"];
  if (!token) {
    res.status(403).send({
      message: "Please provide order station token in the headers",
      code: 403,
      success: false,
      date: Date.now(),
    });
  } else {
    try {
      const company = await CompanyModel.findOne({ id: companyId });
      console.log(company.secret, token);
      if (company.secret != token) {
        return res.status(403).send({
          message: "Not authorized",
          code: 403,
          success: false,
          date: Date.now(),
        });
      }

      next();
    } catch (err) {
      res.status(500).send({
        message:
          "This error is coming from isUser middleware, please report to the sys useristrator !",
        code: 500,
        success: false,
        date: Date.now(),
      });
    }
  }
};
