const { generateRecommendation } = require("../services/recommendationService");

function recommend(req, res) {
  const { customer, activity } = req.body;

  const result = generateRecommendation(customer, activity);

  if (!result.success) {
    return res.status(400).json(result);
  }

  return res.status(200).json(result);
}

module.exports = {
  recommend
};