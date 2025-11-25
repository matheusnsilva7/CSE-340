// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const invValidate = require("../utilities/account-validation");

// Route to build inventory by classification view

router.get(
  "/type/:classificationId",
  utilities.checkEmployee,
  utilities.handleErrors(invController.buildByClassificationId)
);
router.get(
  "/detail/:inv_id",
  utilities.checkEmployee,
  utilities.handleErrors(invController.getInventoryDetail)
);

router.get(
  "/",
  utilities.checkLogin,
  utilities.checkEmployee,
  utilities.handleErrors(invController.buildManagement)
);

router.get(
  "/add-classification",
  utilities.checkEmployee,
  utilities.handleErrors(invController.buildAddClassification)
);

router.post(
  "/add-classification",
  invValidate.classificationRules(),
  utilities.checkEmployee,
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

router.get(
  "/add-inventory",
  utilities.checkEmployee,
  utilities.handleErrors(invController.buildAddInventory)
);

router.post(
  "/add-inventory",
  utilities.checkEmployee,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);

router.get(
  "/getInventory/:classification_id",
  utilities.checkEmployee,
  utilities.handleErrors(invController.getInventoryJSON)
);
router.get(
  "/edit/:inv_id",
  utilities.checkEmployee,
  utilities.handleErrors(invController.editInventoryView)
);

router.post("/update/", utilities.checkEmployee, invController.updateInventory);

router.get(
  "/delete/:inv_id",
  utilities.checkEmployee,
  invController.buildDeleteView
);

router.post("/delete", utilities.checkEmployee, invController.deleteInventory);
module.exports = router;
