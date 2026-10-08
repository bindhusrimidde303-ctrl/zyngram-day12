const { calculateCommission } = require("../services/commissionService");

function createCommission(req, res) {
  const { order, attribution } = req.body;

  const result = calculateCommission(order, attribution);

  if (!result.success) {
    return res.status(400).json(result);
  }

  return res.status(201).json(result);
}

module.exports = {
  createCommission
};