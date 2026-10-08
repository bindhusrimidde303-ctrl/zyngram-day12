function answerAssistantQuestion(question, role) {
  if (!role) {
    return {
      success: false,
      status: "UNAUTHORIZED",
      message: "User role is required."
    };
  }

  const allowedRoles = ["ADMIN", "FRANCHISE_OWNER"];

  if (!allowedRoles.includes(role)) {
    return {
      success: false,
      status: "FORBIDDEN",
      message: "You are not authorized to access assistant data."
    };
  }

  if (!question) {
    return {
      success: false,
      message: "Question is required."
    };
  }

  const text = question.toLowerCase();

  let answer = "No matching authorized information was found.";

  if (text.includes("recharge")) {
    answer = "Authorized recharge information can be retrieved through the recharge backend service.";
  } else if (text.includes("commission")) {
    answer = "Authorized commission information can be retrieved through the commission backend service.";
  } else if (text.includes("unusual") || text.includes("anomaly")) {
    answer = "Authorized anomaly information can be retrieved through the AI anomaly detection service.";
  } else if (text.includes("order")) {
    answer = "Authorized order information can be retrieved through the recharge order service.";
  }

  return {
    success: true,
    question,
    role,
    answer,
    accessMethod: "AUTHORIZED_BACKEND_TOOL"
  };
}

module.exports = {
  answerAssistantQuestion
};