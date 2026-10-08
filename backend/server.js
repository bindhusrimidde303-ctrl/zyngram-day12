const rateLimit = require("express-rate-limit");
const zynoraRoutes = require("./routes/zynoraRoutes");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const zynoraRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please try again later."
    }
});
const PORT = process.env.PORT || 5000;

const geoRoutes = require("./routes/geoRoutes");
const { mapLocation } = require("./services/geoMappingService");
const rechargeRoutes = require("./recharge/routes/rechargeRoutes");
const commissionRoutes = require("./commission/routes/commissionRoutes");
const ledgerRoutes = require("./ledger/routes/ledgerRoutes");
const aiRoutes = require("./ai/routes/aiRoutes");
const adminKnowledgeRoutes = require("./routes/adminKnowledgeRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const monitoringRoutes = require("./routes/monitoringRoutes");
const productionLogRoutes = require("./routes/productionLogRoutes");


app.use(cors());
app.use(express.json());
app.use("/api/zynora", zynoraRateLimiter, zynoraRoutes);
app.use("/api/admin/knowledge", adminKnowledgeRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/monitoring", monitoringRoutes);
app.use("/api/production-logs", productionLogRoutes);

app.use("/api/geo", geoRoutes);
app.use("/api/recharge", rechargeRoutes);
app.use("/api/commission", commissionRoutes);
app.use("/api/ledger", ledgerRoutes);
app.use("/api/ai", aiRoutes);


app.get("/", (req, res) => {
  res.json({
    message: "Zyngram AI Service Platform Backend is running"
  });
});

// Customer Registration API
app.post("/api/customers/register", (req, res) => {
  const {
    name,
    mobile,
    email,
    password,
    latitude,
    longitude,
    accuracy
  } = req.body;

  if (!name || !mobile || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Name, mobile, email and password are required."
    });
  }

  if (
    latitude === undefined ||
    longitude === undefined ||
    accuracy === undefined
  ) {
    return res.status(400).json({
      success: false,
      message: "GPS location is required."
    });
  }

  const geoMapping = mapLocation(
    latitude,
    longitude,
    accuracy
  );

  const customer = {
    customerId: Date.now(),
    name,
    mobile,
    email,
    latitude,
    longitude,
    accuracy,
    geoMapping,
    status: "ACTIVE",
    createdAt: new Date().toISOString()
  };

  res.status(201).json({
    success: true,
    message: "Customer registered successfully.",
    customer
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});