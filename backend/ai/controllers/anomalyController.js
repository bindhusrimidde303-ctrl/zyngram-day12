const { detectAnomaly } = require("../services/anomalyService");

function analyzeAnomaly(req, res) {
  const result = detectAnomaly(req.body);

  if (!result.success) {
    return res.status(400).json(result);
  }

  return res.status(200).json(result);
}

module.exports = {
  analyzeAnomaly
};