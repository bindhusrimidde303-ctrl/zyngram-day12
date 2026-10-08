const {
  createLedgerEntries,
  getLedgerEntries
} = require("../services/ledgerService");

function postLedger(req, res) {
  const { order, commissions } = req.body;

  const result = createLedgerEntries(order, commissions);

  if (!result.success) {
    return res.status(400).json(result);
  }

  return res.status(201).json(result);
}

function getLedger(req, res) {
  return res.json({
    success: true,
    entries: getLedgerEntries()
  });
}

module.exports = {
  postLedger,
  getLedger
};