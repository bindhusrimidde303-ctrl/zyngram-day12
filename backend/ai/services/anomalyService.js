function detectAnomaly(data) {
  if (!data) {
    return {
      success: false,
      message: "Transaction data is required."
    };
  }

  const {
    orderId,
    duplicateProcessing = false,
    rechargeCount = 0,
    commissionProcessingCount = 0,
    geographicMismatch = false
  } = data;

  let anomalyType = "NONE";
  let severity = "LOW";
  let reason = "No suspicious activity detected.";
  let detectionMethod = "Rule-based activity analysis";
  let recommendedAction = "Allow transaction.";

  if (duplicateProcessing || commissionProcessingCount > 1) {
    anomalyType = "DUPLICATE_PROCESSING";
    severity = "HIGH";
    reason = "The same order was processed more than once.";
    detectionMethod = "Order ID duplicate check";
    recommendedAction = "Block duplicate processing and review the original transaction.";
  } else if (geographicMismatch) {
    anomalyType = "GEOGRAPHIC_ANOMALY";
    severity = "MEDIUM";
    reason = "Transaction activity does not match the expected geographic mapping.";
    detectionMethod = "Geographic consistency check";
    recommendedAction = "Review the transaction location and franchise mapping.";
  } else if (rechargeCount >= 20) {
    anomalyType = "ABNORMAL_TRANSACTION_SPIKE";
    severity = "MEDIUM";
    reason = `Unusually high recharge activity detected: ${rechargeCount} transactions.`;
    detectionMethod = "Transaction volume threshold";
    recommendedAction = "Review recent recharge activity.";
  }

  if (anomalyType === "NONE") {
    return {
      success: true,
      anomalyDetected: false,
      message: "No anomaly detected."
    };
  }

  return {
    success: true,
    anomalyDetected: true,
    anomaly: {
      anomalyId: `ANM-${Date.now()}`,
      type: anomalyType,
      severity,
      relatedOrder: orderId || null,
      reason,
      detectionMethod,
      recommendedAction,
      createdAt: new Date().toISOString()
    }
  };
}

module.exports = {
  detectAnomaly
};