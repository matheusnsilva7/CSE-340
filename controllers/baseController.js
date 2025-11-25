const utilities = require("../utilities/");
const baseController = {};

baseController.buildHome = async function (req, res) {
  console.log(res.locals.accountData);
  const nav = await utilities.getNav();
  req.flash("notice", "This is a flash message.");
  res.render("index", {
    title: "Home",
    nav,
    user: res.locals.accountData
      ? res.locals.accountData.account_firstname
      : false,
  });
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
