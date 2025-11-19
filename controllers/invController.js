const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();

  if (!data.length) {
    const err = new Error("Data not found");
    err.status = 404;
    throw err;
  }

  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

invCont.getInventoryDetail = async function (req, res, next) {
  try {
    const inv_id = Number(req.params.inv_id);
    if (Number.isNaN(inv_id)) {
      const err = new Error("Invalid inventory id");
      err.status = 400;
      throw err;
    }

    const vehicle = await invModel.getInventoryById(inv_id);
    if (!vehicle) {
      const err = new Error("Vehicle not found");
      err.status = 404;
      throw err;
    }

    const vehicleHTML = utilities.buildVehicleDetailHTML(vehicle);

    const pageTitle = `${vehicle.inv_year || ""} ${vehicle.inv_make || ""} ${
      vehicle.inv_model || ""
    }`.trim();
    let nav = await utilities.getNav();
    res.render("inventory/detail", {
      title: pageTitle,
      vehicle,
      vehicleHTML,
      nav,
    });
  } catch (err) {
    next(err);
  }
};

invCont.buildManagement = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
    });
  } catch (err) {
    next(err);
  }
};

invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
    classification_name: false,
  });
};

invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body;

  try {
    const addResult = await invModel.addClassification(classification_name);

    if (addResult) {
      let nav = await utilities.getNav();
      req.flash("notice", `Classification '${classification_name}' added.`);
      res.render("inventory/management", {
        title: "Inventory Management",
        nav,
        errors: null,
      });
    } else {
      req.flash("notice", "Failed to add classification.");
      res.redirect("/inv/add-classification");
    }
  } catch (err) {
    next(err);
  }
};

invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  let classifications = await utilities.buildClassificationList();

  res.render("inventory/add-inventory", {
    title: "Add New Vehicle",
    nav,
    classifications,
    errors: null,
    classification_id: false,
    inv_make: false,
    inv_model: false,
    inv_year: false,
    inv_description: false,
    inv_image: false,
    inv_thumbnail: false,
    inv_price: false,
    inv_miles: false,
    inv_color: false,
  });
};

invCont.addInventory = async function (req, res, next) {
  try {
    const vehicleData = req.body;
    const result = await invModel.addInventory(vehicleData);

    if (result) {
      let nav = await utilities.getNav();
      req.flash("notice", "Vehicle added successfully.");
      res.render("inventory/management", {
        title: "Inventory Management",
        nav,
        errors: null,
      });
    } else {
      req.flash("notice", "Failed to add vehicle.");
      res.redirect("/inv/add-inventory");
    }
  } catch (err) {
    next(err);
  }
};

module.exports = invCont;
