const invModel = require("../models/inventory-model");
const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += "<li>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        'details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" /></a>';
      grid += '<div class="namePrice">';
      grid += "<h2>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>";
      grid += "</h2>";
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>";
      grid += "</div>";
      grid += "</li>";
    });
    grid += "</ul>";
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};


Util.formatCurrencyUSD = function (amount) {
  if (amount === undefined || amount === null || isNaN(Number(amount)))
    return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount));
};

Util.formatNumberWithCommas = function (num) {
  if (num === undefined || num === null || isNaN(Number(num))) return "—";
  return Number(num).toLocaleString("en-US");
};

/**
 * Build the HTML block for the vehicle detail content.
 * The returned string is intended to be injected into the EJS with <%- vehicleHTML %>
 */
Util.buildVehicleDetailHTML = function (vehicle = {}) {
  const make = vehicle.inv_make || "Unknown Make";
  const model = vehicle.inv_model || "Unknown Model";
  const year = vehicle.inv_year || "";
  const price = this.formatCurrencyUSD(vehicle.inv_price);
  const mileage = this.formatNumberWithCommas(vehicle.inv_miles);
  const color = vehicle.inv_color || "N/A";
  const description = vehicle.inv_description || "";

  return `
    <section class="vehicle-meta">
      <h1 class="vehicle-title">${year} ${make} ${model}</h1>
      <p class="vehicle-price" aria-label="Price">${price}</p>

      <ul class="vehicle-highlights" aria-label="Vehicle highlights">
        <li><strong>Mileage:</strong> ${mileage} miles</li>
        <li><strong>Color:</strong> ${color}</li>
      </ul>

      <div class="vehicle-description">
        <h2>Description</h2>
        <p>${
          description.replace(/\n/g, "<br>") ||
          "No additional description provided."
        }</p>
      </div>
    </section>
  `;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = Util;
