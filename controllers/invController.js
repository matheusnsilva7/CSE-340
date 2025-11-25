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
    user: res.locals.accountData
      ? res.locals.accountData.account_firstname
      : false,
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
      user: res.locals.accountData
        ? res.locals.accountData.account_firstname
        : false,
    });
  } catch (err) {
    next(err);
  }
};

invCont.buildManagement = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();

    const classificationSelect = await utilities.buildClassificationList();

    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect,
      errors: null,
      user: res.locals.accountData
        ? res.locals.accountData.account_firstname
        : false,
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
    user: res.locals.accountData
      ? res.locals.accountData.account_firstname
      : false,
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
        user: res.locals.accountData
          ? res.locals.accountData.account_firstname
          : false,
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
    user: res.locals.accountData
      ? res.locals.accountData.account_firstname
      : false,
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
        user: res.locals.accountData
          ? res.locals.accountData.account_firstname
          : false,
      });
    } else {
      req.flash("notice", "Failed to add vehicle.");
      res.redirect("/inv/add-inventory");
    }
  } catch (err) {
    next(err);
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(
    classification_id
  );
  if (invData[0].inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
};

invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  let nav = await utilities.getNav();
  const itemData = await invModel.getInventoryById(inv_id);
  const classificationSelect = await utilities.buildClassificationList(
    itemData.classification_id
  );
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id,
    user: res.locals.accountData
      ? res.locals.accountData.account_firstname
      : false,
  });
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;
  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  );

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model;
    req.flash("notice", `The ${itemName} was successfully updated.`);
    res.redirect("/inv/");
  } else {
    const classificationSelect = await utilities.buildClassificationList(
      classification_id
    );
    const itemName = `${inv_make} ${inv_model}`;
    req.flash("notice", "Sorry, the insert failed.");
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
      user: res.locals.accountData
        ? res.locals.accountData.account_firstname
        : false,
    });
  }
};

invCont.buildDeleteView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id, 10);
    const nav = await utilities.getNav();

    const invData = await invModel.getInventoryById(inv_id);

    if (!invData || Object.keys(invData).length === 0) {
      req.flash("error", "Inventory item not found.");
      return res.redirect("/inv/management");
    }

    const name = `${invData.inv_make} ${invData.inv_model}`;

    res.render("inventory/delete-confirm", {
      title: `Delete ${name}`,
      nav,
      errors: null,
      inv: invData,
      user: res.locals.accountData
        ? res.locals.accountData.account_firstname
        : false,
    });
  } catch (error) {
    console.error("Error in buildDeleteView:", error);
    return next(error);
  }
};

invCont.deleteInventory = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.body.inv_id, 10);

    const data = await invModel.deleteInventoryItem(inv_id);

    if (data && data.rowCount && data.rowCount > 0) {
      req.flash("success", "Inventory item deleted successfully.");
      return res.redirect("/inv/");
    }

    // delete failed
    req.flash("error", "Sorry, the delete failed. Please try again.");
    return res.redirect(`/inv/delete/${inv_id}`);
  } catch (error) {
    console.error("Error in deleteInventory:", error);
    return next(error);
  }
};
module.exports = invCont;
