const express = require("express");
const { analyzeAnomaly } = require("../controllers/anomalyController");

const router = express.Router();

router.post("/anomaly-detection", analyzeAnomaly);

module.exports = router;