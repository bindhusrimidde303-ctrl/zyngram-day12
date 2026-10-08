function generateRecommendation(customer, activity) {
  if (!customer || !activity) {
    return {
      success: false,
      message: "Customer and activity data are required."
    };
  }

  const rechargeCount = Number(activity.rechargeCount || 0);
  const totalRechargeAmount = Number(activity.totalRechargeAmount || 0);
  const recentRecharge = Boolean(activity.recentRecharge);

  let activityLevel = "LOW";

  if (rechargeCount >= 5 || totalRechargeAmount >= 1000) {
    activityLevel = "HIGH";
  } else if (rechargeCount >= 2 || totalRechargeAmount >= 500) {
    activityLevel = "MEDIUM";
  }

  let recommendation = "Mobile Recharge";
  let reason = "The available customer activity shows recharge usage.";
  let nextAction = "Continue monitoring service activity.";

  if (activityLevel === "HIGH") {
    recommendation = "Mobile Recharge";
    reason = `Customer has ${rechargeCount} recharge transactions with total recharge activity of ₹${totalRechargeAmount}.`;
    nextAction = "Offer relevant recharge options based on the customer's recent activity.";
  } else if (activityLevel === "MEDIUM") {
    recommendation = "Mobile Recharge";
    reason = `Customer has ${rechargeCount} recharge transactions and ₹${totalRechargeAmount} in recorded recharge activity.`;
    nextAction = "Show suitable recharge options when the customer returns.";
  } else if (recentRecharge) {
    recommendation = "Mobile Recharge";
    reason = "The customer has a recent recharge recorded in the available activity data.";
    nextAction = "Show the recharge service for the next service interaction.";
  }

  return {
    success: true,
    customerId: customer.customerId,
    activityLevel,
    recommendation,
    reason,
    nextAction,
    evidence: {
      rechargeCount,
      totalRechargeAmount,
      recentRecharge
    }
  };
}

module.exports = {
  generateRecommendation
};