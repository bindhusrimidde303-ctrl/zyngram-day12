const { answerAssistantQuestion } = require("../services/assistantService");

function askAssistant(req, res) {
  const { question, role } = req.body;

  const result = answerAssistantQuestion(question, role);

  if (!result.success) {
    const statusCode =
      result.status === "UNAUTHORIZED"
        ? 401
        : result.status === "FORBIDDEN"
        ? 403
        : 400;

    return res.status(statusCode).json(result);
  }

  return res.status(200).json(result);
}

module.exports = {
  askAssistant
};