const express = require("express")
const router = express.Router()

router.get("/cause-error", (req, res, next) => {
  try {
    throw new Error("Intentional 500 error triggered for testing")
  } catch (err) {
    err.status = 500
    next(err)
  }
})

module.exports = router