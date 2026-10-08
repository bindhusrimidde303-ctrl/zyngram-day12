const {
  createRechargeOrder,
  validateRechargeOrder,
  processMockRecharge
} = require("../services/rechargeService");

function createOrder(req, res) {
  const {
    mobileNumber,
    operator,
    circle,
    amount
  } = req.body;

  const result = createRechargeOrder({
    mobileNumber,
    operator,
    circle,
    amount
  });

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.status(201).json(result);
}

function validateOrder(req, res) {
  const result = validateRechargeOrder(req.body);

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
}

function processRecharge(req, res) {
  const result = processMockRecharge(req.body);

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
}

module.exports = {
  createOrder,
  validateOrder,
  processRecharge
};