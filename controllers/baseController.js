const utilities = require("../utilities/");
const baseController = {};

baseController.buildHome = async function (req, res) {
  const nav = await utilities.getNav();
  res.render("index", { title: "Home", nav });
};

baseController.throwError = (req, res, next) => {
  try {
    throw new Error("Intentional 500 error triggered for testing");
  } catch (err) {
    err.status = 500;
    next(err);
  }
};

module.exports = baseController;
