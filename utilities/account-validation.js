const utilities = require(".");
const { body, validationResult } = require("express-validator");
const invModel = require("../models/inventory-model");
const validate = {};

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registationRules = () => {
  return [
    // firstname is required and must be string
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."), // on error this message is sent.

    // lastname is required and must be string
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."), // on error this message is sent.

    // valid email is required and cannot already exist in the DB
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required."),

    // password is required and must be strong password
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};

validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    });
    return;
  }
  next();
};

/* ******************************
 *  Inventory Validation Rules
 ****************************** */
validate.inventoryRules = () => {
  return [
    // classification_id must be numeric and required
    body("classification_id")
      .trim()
      .isNumeric()
      .withMessage("Please choose a valid classification."),

    // Make
    body("inv_make")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Make must be at least 2 characters long."),

    // Model
    body("inv_model")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Model must be at least 2 characters long."),

    // Year
    body("inv_year")
      .trim()
      .isInt({ min: 1900, max: 2100 })
      .withMessage("Year must be a valid 4-digit number."),

    // Description
    body("inv_description")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Description must be at least 5 characters long."),

    // Image path
    body("inv_image").trim().notEmpty().withMessage("Image path is required."),

    // Thumbnail path
    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Thumbnail path is required."),

    // Price
    body("inv_price")
      .trim()
      .isFloat({ min: 0 })
      .withMessage("Price must be a valid number."),

    // Miles
    body("inv_miles")
      .trim()
      .isInt({ min: 0 })
      .withMessage("Miles must be a valid number."),

    // Color
    body("inv_color")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Color must be at least 2 characters."),
  ];
};

/* ******************************
 *  Check and Return Errors
 ****************************** */
validate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    let classifications = await utilities.buildClassificationList(
      req.body.classification_id
    );
    console.log("Miles received:", req.body.inv_miles);
    console.log(errors);
    req.flash("notice", "Please correct the errors in the form.");

    return res.render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      errors: errors.array(),
      classifications,
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_year: req.body.inv_year,
      inv_description: req.body.inv_description,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail,
      inv_price: req.body.inv_price,
      inv_miles: req.body.inv_miles,
      inv_color: req.body.inv_color,
    });
  }

  next();
};

validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a classification name."),
  ];
};

validate.checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();

    req.flash("notice", "Please correct the errors in the form.");

    return res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: errors.array(),
      classification_name: req.body.classification_name,
    });
  }

  next();
};
module.exports = validate;
