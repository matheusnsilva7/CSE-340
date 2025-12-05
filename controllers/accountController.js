const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const bcrypt = require("bcryptjs");

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    user: res.locals.accountData
      ? res.locals.accountData.account_firstname
      : false,
  });
}

async function buildAccount(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/account", {
    title: "buildAccount",
    nav,
    user: res.locals.accountData
      ? res.locals.accountData.account_firstname
      : false,
  });
}
/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
    user: res.locals.accountData
      ? res.locals.accountData.account_firstname
      : false,
  });
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  // Hash the password before storing
  let hashedPassword;
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash(
      "notice",
      "Sorry, there was an error processing the registration."
    );
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
      user: res.locals.accountData
        ? res.locals.accountData.account_firstname
        : false,
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      user: res.locals.accountData
        ? res.locals.accountData.account_firstname
        : false,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      user: res.locals.accountData
        ? res.locals.accountData.account_firstname
        : false,
      errors: null,
    });
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
      user: res.locals.accountData
        ? res.locals.accountData.account_firstname
        : false,
    });
    return;
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 }
      );
      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        });
      }
      return res.redirect("/account/");
    } else {
      req.flash(
        "message notice",
        "Please check your credentials and try again."
      );
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
        user: res.locals.accountData
          ? res.locals.accountData.account_firstname
          : false,
      });
    }
  } catch (error) {
    throw new Error("Access Forbidden");
  }
}

async function buildManagement(req, res, next) {
  try {
    let nav = await utilities.getNav();

    if (!res.locals.accountData) {
      req.flash("notice", "Please log in.");
      return res.redirect("/account/login");
    }
    res.render("account/account", {
      title: "Account Management",
      nav,
      errors: null,
      user: res.locals.accountData
        ? res.locals.accountData.account_firstname
        : false,
      type: res.locals.accountData.account_type,
      account_id: res.locals.accountData.account_id,
    });
  } catch (err) {
    next(err);
  }
}

async function buildUpdateAccountView(req, res) {
  let nav = await utilities.getNav();
  const account_id = parseInt(req.params.account_id);
  const accountData = await accountModel.getAccountById(account_id);

  return res.render("account/update-account", {
    title: "Update Account",
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,

    accountData,
    nav,
    user: res.locals.accountData
      ? res.locals.accountData.account_firstname
      : false,

    errors: null,
  });
}

async function updateAccount(req, res) {
  const { account_firstname, account_lastname, account_email, account_id } =
    req.body;

  const updateResult = await accountModel.updateAccountInfo(
    account_id,
    account_firstname,
    account_lastname,
    account_email
  );

  if (updateResult) {
    req.flash("notice", "Account updated successfully.");
  } else {
    req.flash("notice", "Update failed. Please try again.");
  }

  const updatedAccount = await accountModel.getAccountById(account_id);

  const accessToken = jwt.sign(
    updatedAccount,
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: 3600 * 1000 }
  );

  if (process.env.NODE_ENV === "development") {
    res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
  } else {
    res.cookie("jwt", accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: 3600 * 1000,
    });
  }

  return res.redirect("/account");
}

async function updatePassword(req, res) {
  const { account_password, account_id } = req.body;

  // Hash password
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(account_password, 10);
  } catch (error) {
    console.error("Password hashing failed:", error);
    req.flash("notice", "Password update failed.");
    return res.redirect(`/account/update/${account_id}`);
  }

  const updateResult = await accountModel.updatePassword(
    account_id,
    hashedPassword
  );

  if (updateResult) {
    req.flash("notice", "Password updated successfully.");
  } else {
    req.flash("notice", "Password update failed.");
  }

  const updatedAccount = await accountModel.getAccountById(account_id);

  let nav = await utilities.getNav();

  return res.render("account/account", {
    title: "Account Management",
    accountData: updatedAccount,
    nav,
    errors: null,
    user: res.locals.accountData
      ? res.locals.accountData.account_firstname
      : false,
    type: res.locals.accountData.account_type,
  });
}

async function logout(req, res) {
  res.clearCookie("jwt");
  req.flash("notice", "You have been logged out.");
  return res.redirect("/");
}

async function buildUserComments(req, res, next) {
  try {
    const account_id = res.locals.accountData.account_id;

    const comments = await accountModel.getCommentsByAccountId(account_id);

    let nav = await utilities.getNav();

    res.render("account/comments", {
      title: "My Comments",
      nav,
      comments,
      accountData: res.locals.accountData,
      user: res.locals.accountData
        ? res.locals.accountData.account_firstname
        : false,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  buildLogin,
  logout,
  buildUpdateAccountView,
  updateAccount,
  updatePassword,
  buildManagement,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccount,
  buildUserComments,
};
