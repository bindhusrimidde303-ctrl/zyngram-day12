const path = require("path");
const { ingestDocument } = require("./services/zynoraIngestionService");

const filePath = path.join(
    __dirname,
    "knowledge",
    "zyngram-overview.txt"
);

ingestDocument({
    filePath,
    title: "Zyngram Overview",
    category: "Company",
    source: "zyngram-overview.txt",
    version: "1.0",
    status: "APPROVED"
});