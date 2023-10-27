const { default: axios } = require("axios");
require("dotenv").config({ path: "../config/.env" });
const { v4: uuidv4 } = require("uuid");
const TransactionModel = require("../models/Transaction/Transaction");
const CompanyModel = require("../models/Company/Company");

const baseUrl = "https://test-tnpost.mtf.gateway.mastercard.com";
const userId = "1701001256";
const password = "7fd02d869f59a47e6103bc4c29448027";
const apiVersion = "72";

exports.createSession = async (req, res) => {
  try {
    const { transactionID, amount, description, returnUrl } = req.body;
    const response = await axios.post(
      `${baseUrl}/api/rest/version/${apiVersion}/merchant/${userId}/session`,
      {
        apiOperation: "INITIATE_CHECKOUT",
        interaction: {
          operation: "PURCHASE",
          returnUrl: returnUrl,
          merchant: {
            name: "SEMSEM PAY",
            url: "https://www.semsemapp.com",
            logo: "https://i.ibb.co/RpJd05J/image.png",
          },
          displayControl: {
            billingAddress: "HIDE",
            customerEmail: "HIDE",
          },
          style: {
            accentColor: "#000000",
          },
        },
        order: {
          amount: amount,
          currency: "TND",
          id: transactionID,
          description: description,
          notificationUrl: "https://api-pay.semsemapp.com/api/v1/gateway-hook",
        },
      },
      {
        auth: {
          username: "merchant." + userId,
          password: password,
        },
      }
    );

    if (response.status === 201) {
      const transaction = new TransactionModel({
        id: uuidv4(),
        sessionId: response.data.session.id,
        companyId: req.headers["x-pay-id"],
        orderId: transactionID,
        returnUrl: returnUrl,
      });

      await transaction.save();
      return res.status(200).json({
        message: "Session created successfully",
        code: 200,
        success: true,
        data: "https://pay.semsemapp.com/" + response.data.session.id,
      });
    } else {
      // Handle unexpected status codes from the server
      console.error(`Unexpected status code: ${response.status}`);
      return res.status(500).json({
        message: "Internal server error",
        code: 500,
        success: false,
        date: Date.now(),
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "An error occurred while creating the session",
      code: 500,
      success: false,
      date: Date.now(),
    });
  }
};

// exports.payWithCard = async (req, res) => {
//   try {
//     const { cardNumber, expM, expY, CVV, orderID, amount, sessionID } = req.body;
//     const TransactionID = uuidv4();
//     const response = await axios.post(
//       `${baseUrl}/form/version/${apiVersion}/merchant/${userId}/session/${sessionID}`,
//       [
//         { field: "number", value: cardNumber },
//         { field: "sourceOfFundsType", value: "card" },
//       ]
//     );

//     if (response.status === 200) {
//       const response1 = await axios.post(
//         `${baseUrl}/form/version/${apiVersion}/merchant/${userId}/session/${sessionID}`,
//         [
//           { field: "expiryMonth", value: expM },
//           { field: "sourceOfFundsType", value: "card" },
//         ]
//       );
//       if (response1.status === 200) {
//         console.log("pass 1");

//         const response2 = await axios.post(
//           `${baseUrl}/form/version/${apiVersion}/merchant/${userId}/session/${sessionID}`,
//           [
//             { field: "expiryYear", value: expY },
//             { field: "sourceOfFundsType", value: "card" },
//           ]
//         );
//         if (response2.status === 200) {
//           console.log("pass 2");

//           const response3 = await axios.post(
//             `${baseUrl}/form/version/${apiVersion}/merchant/${userId}/session/${sessionID}`,
//             [
//               { field: "securityCode", value: CVV },
//               { field: "sourceOfFundsType", value: "card" },
//             ]
//           );
//           if (response3.status === 200) {
//             console.log("pass 3");

//             const response4 = await axios.put(
//               `${baseUrl}/form/version/${apiVersion}/merchant/${userId}/session/${sessionID}`,
//               { frameEmbeddingMitigation: ["javascript"] }
//             );
//             if (response4.status === 200) {
//               console.log("pass 4");

//               const finalResponse = await axios.put(
//                 `${baseUrl}/api/rest/version/${apiVersion}/merchant/${userId}/order/${orderID}/transaction/${TransactionID}`,
//                 {
//                   apiOperation: "PAY",
//                   order: { amount: amount, currency: "TND" },
//                   session: { id: sessionID },
//                 },

//                 {
//                   auth: {
//                     username: "merchant." + userId,
//                     password: password,
//                   },
//                 }
//               );
//               console.log(finalResponse);
//               return res.status(200).json({
//                 message: "please have a look in the data value !",
//                 code: 200,
//                 success: true,
//                 data: finalResponse.data, // Assuming the response contains relevant data
//               });
//             }
//           }
//         }
//       }
//     } else {
//       // Handle unexpected status codes from the server
//       console.error(`Unexpected status code: ${response.status}`);
//       return res.status(500).json({
//         message: "Internal server error",
//         code: 500,
//         success: false,
//         date: Date.now(),
//       });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       message: "An error occurred while creating the session",
//       code: 500,
//       success: false,
//       date: Date.now(),
//     });
//   }
// };

exports.updateTransaction = async (req, res) => {
  try {
    const data = req.body;
    const transaction = await TransactionModel.findOne({ orderId: data.id });
    if (!transaction) {
      return;
    }
    transaction.Details = data;
    await transaction.save();
    return;
  } catch (err) {
    console.log(err)

    res.status(500).json({
      message: "An error occurred while getting order info",
      code: 500,
      success: false,
      date: Date.now(),
    });
  }
};
exports.getOrderInfo = async (req, res) => {
  try {
    const { orderID } = req.params;
    const response = await axios.get(
      `${baseUrl}/api/rest/version/${apiVersion}/merchant/${userId}/order/${orderID}`,
      // Provide any required data in the request body here if needed
      // For example: { key: 'value' }
      {
        auth: {
          username: "merchant." + userId,
          password: password,
        },
      }
    );

    if (response.status === 200) {
      console.log(response.data);
      return res.status(200).json({
        message: "retrieved order infos",
        code: 200,
        success: true,
        data: response.data, // Assuming the response contains relevant data
      });
    } else {
      // Handle unexpected status codes from the server
      console.error(`Unexpected status code: ${response.status}`);
      return res.status(500).json({
        message: "Internal server error",
        code: 500,
        success: false,
        date: Date.now(),
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "An error occurred while getting order info",
      code: 500,
      success: false,
      date: Date.now(),
    });
  }
};
exports.getSessionInfo = async (req, res) => {
  try {
    const { orderID } = req.params;
    const transaction = await TransactionModel.findOne({ sessionId: orderID });
    console.log(transaction)
    if (!transaction) {
      return res.status(404).json({
        message: "cannot find transaction !",
        code: 404,
        success: false,
      });
    }
    return res.status(200).json({
      message: "retrieved order infos",
      code: 200,
      success: true,
      data: transaction.returnUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "An error occurred while getting order info",
      code: 500,
      success: false,
      date: Date.now(),
    });
  }
};

exports.createCompany = async (req, res) => {
  try {
    const { name, address, email, image, type, matricule } = req.body;

    const foundCompany = await CompanyModel.findOne({
      email,
    });
    if (foundCompany) {
      return res.status(406).send({
        message: "A company with this email already exists.",
        code: 406,
        success: false,
        date: Date.now(),
      });
    }

    let newCompany = new CompanyModel({
      id: uuidv4(),
      name,
      address,
      email,
      type,
      matricule,
      secret: uuidv4(),
    });
    await newCompany.save();
    res.status(200).send({
      message: "Created company",
      code: 200,
      success: true,
      id: newCompany.id,
      secret: newCompany.secret,
      date: Date.now(),
    });
  } catch (error) {
    res.status(500).send({
      message:
        "This error is coming from createCompany endpoint, please report to the sys administrator !",
      code: 500,
      success: false,
      date: Date.now(),
    });
  }
};
