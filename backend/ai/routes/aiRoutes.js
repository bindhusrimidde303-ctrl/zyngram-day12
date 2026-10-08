const express = require("express");
const { recommend } = require("../controllers/recommendationController");
const anomalyRoutes = require("./anomalyRoutes");
const assistantRoutes = require("./assistantRoutes");

const router = express.Router();

router.post("/recommend", recommend);

router.use("/", anomalyRoutes);
router.use("/", assistantRoutes);

module.exports = router;