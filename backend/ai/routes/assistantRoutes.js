const express = require("express");
const { askAssistant } = require("../controllers/assistantController");

const router = express.Router();

router.post("/assistant", askAssistant);

module.exports = router;