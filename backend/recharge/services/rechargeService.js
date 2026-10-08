// Mobile Recharge Service
// Mock/Sandbox recharge provider for trainee prototype

const VALID_OPERATORS = [
  "Example Telecom",
  "Airtel",
  "Jio",
  "Vi",
  "BSNL"
];

const VALID_CIRCLES = [
  "Andhra Pradesh",
  "Telangana",
  "Karnataka",
  "Tamil Nadu",
  "Maharashtra"
];

function validateRechargeInput({
  mobileNumber,
  operator,
  circle,
  amount
}) {
  if (!mobileNumber || !/^\d{10}$/.test(String(mobileNumber))) {
    return {
      valid: false,
      message: "Enter a valid 10-digit mobile number."
    };
  }

  if (!operator || !VALID_OPERATORS.includes(operator)) {
    return {
      valid: false,
      message: "Select a valid mobile operator."
    };
  }

  if (!circle || !VALID_CIRCLES.includes(circle)) {
    return {
      valid: false,
      message: "Select a valid circle/region."
    };
  }

  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return {
      valid: false,
      message: "Recharge amount must be greater than zero."
    };
  }

  return {
    valid: true
  };
}

function createRechargeOrder({
  mobileNumber,
  operator,
  circle,
  amount
}) {
  const validation = validateRechargeInput({
    mobileNumber,
    operator,
    circle,
    amount
  });

  if (!validation.valid) {
    return {
      success: false,
      status: "FAILED",
      message: validation.message
    };
  }

  return {
    success: true,
    order: {
      orderId: `RCH-${Date.now()}`,
      mobileNumber,
      operator,
      circle,
      amount,
      status: "CREATED",
      createdAt: new Date().toISOString()
    }
  };
}

function validateRechargeOrder(order) {
  if (!order || !order.orderId) {
    return {
      success: false,
      status: "FAILED",
      message: "Invalid recharge order."
    };
  }

  return {
    success: true,
    status: "VALIDATED",
    message: "Recharge order validated."
  };
}

function processMockRecharge(order) {
  if (!order || !order.orderId) {
    return {
      success: false,
      status: "FAILED",
      message: "Invalid recharge order."
    };
  }

  return {
    success: true,
    status: "SUCCESS",
    message: "Recharge processed successfully.",
    provider: "MOCK_PROVIDER",
    processedAt: new Date().toISOString()
  };
}

module.exports = {
  validateRechargeInput,
  createRechargeOrder,
  validateRechargeOrder,
  processMockRecharge
};