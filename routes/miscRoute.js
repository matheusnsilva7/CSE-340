const express = require("express");
const router = express.Router();
const utilities = require("../utilities");
const baseController = require("../controllers/baseController");

router.get("/cause-error", utilities.handleErrors(baseController.throwError));

module.exports = router;
