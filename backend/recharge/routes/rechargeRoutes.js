const express = require("express");

const {
  createOrder,
  validateOrder,
  processRecharge
} = require("../controllers/rechargeController");

const router = express.Router();

router.post("/orders", createOrder);
router.post("/orders/validate", validateOrder);
router.post("/orders/process", processRecharge);

module.exports = router;