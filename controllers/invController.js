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

module.exports = invCont;
