const commissionRules = {
  POINT: 0.02,
  CENTER: 0.05,
  HUB: 0.05,
  COMMAND: 0.05
};

const processedOrders = new Set();

function calculateCommission(order, attribution) {
  if (!order || !attribution) {
    return {
      success: false,
      message: "Order and attribution are required."
    };
  }

  if (processedOrders.has(order.orderId)) {
    return {
      success: false,
      status: "DUPLICATE",
      message: "Commission already processed for this order."
    };
  }

  const amount = Number(order.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    return {
      success: false,
      message: "Invalid order amount."
    };
  }

  const levels = [
    {
      level: "POINT",
      ownerId: attribution.pointId,
      rate: commissionRules.POINT
    },
    {
      level: "CENTER",
      ownerId: attribution.centerId,
      rate: commissionRules.CENTER
    },
    {
      level: "HUB",
      ownerId: attribution.hubId,
      rate: commissionRules.HUB
    },
    {
      level: "COMMAND",
      ownerId: attribution.commandId,
      rate: commissionRules.COMMAND
    }
  ];

  const commissions = levels.map(item => ({
    orderId: order.orderId,
    ownerId: item.ownerId,
    franchiseLevel: item.level,
    ruleId: `TEST-${item.level}-V1`,
    rate: item.rate,
    amount: Number((amount * item.rate).toFixed(2)),
    status: "CALCULATED",
    createdAt: new Date().toISOString()
  }));

  processedOrders.add(order.orderId);

  return {
    success: true,
    orderId: order.orderId,
    commissions,
    totalCommission: Number(
      commissions.reduce((sum, item) => sum + item.amount, 0).toFixed(2)
    )
  };
}

module.exports = {
  commissionRules,
  calculateCommission
};