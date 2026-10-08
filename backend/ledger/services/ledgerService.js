const ledgerEntries = [];

function createLedgerEntries(order, commissions) {
  if (!order || !Array.isArray(commissions) || commissions.length === 0) {
    return {
      success: false,
      message: "Order and commission entries are required."
    };
  }

  const existing = ledgerEntries.find(
    entry => entry.orderId === order.orderId
  );

  if (existing) {
    return {
      success: false,
      status: "DUPLICATE",
      message: "Ledger entries already exist for this order."
    };
  }

  const entries = commissions.map(commission => ({
    ledgerId: `LED-${Date.now()}-${commission.franchiseLevel}`,
    orderId: order.orderId,
    ownerId: commission.ownerId,
    franchiseLevel: commission.franchiseLevel,
    amount: commission.amount,
    entryType: "COMMISSION_CREDIT",
    status: "POSTED",
    createdAt: new Date().toISOString()
  }));

  ledgerEntries.push(...entries);

  return {
    success: true,
    orderId: order.orderId,
    status: "POSTED",
    entries
  };
}

function getLedgerEntries() {
  return ledgerEntries;
}

module.exports = {
  createLedgerEntries,
  getLedgerEntries
};