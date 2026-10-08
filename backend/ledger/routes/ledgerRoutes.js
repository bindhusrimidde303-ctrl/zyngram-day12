const express = require("express");

const {
  postLedger,
  getLedger
} = require("../controllers/ledgerController");

const router = express.Router();

router.post("/post", postLedger);
router.get("/", getLedger);

module.exports = router;