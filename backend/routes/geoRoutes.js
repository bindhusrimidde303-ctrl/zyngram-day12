const express = require("express");
const router = express.Router();

const {
  mapLocation
} = require("../services/geoMappingService");

// POST /api/geo/reverse-geocode
router.post("/reverse-geocode", (req, res) => {
  const {
    latitude,
    longitude,
    accuracy
  } = req.body;

  const result = mapLocation(
    latitude,
    longitude,
    accuracy
  );

  if (result.status === "INVALID") {
    return res.status(400).json({
      success: false,
      message: result.message
    });
  }

  return res.status(200).json({
    success: true,
    geo: result
  });
});

module.exports = router;