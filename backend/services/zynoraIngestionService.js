const fs = require("fs");
const path = require("path");
const db = require("../db");

function cleanText(text) {
    return text
        .replace(/\r\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/[ \t]+/g, " ")
        .trim();
}

function splitIntoChunks(text, chunkSize = 500) {
    const words = text.split(/\s+/);
    const chunks = [];

    for (let i = 0; i < words.length; i += chunkSize) {
        chunks.push(words.slice(i, i + chunkSize).join(" "));
    }

    return chunks;
}

function readDocument(filePath) {
    const extension = path.extname(filePath).toLowerCase();

    if (extension === ".txt" || extension === ".md") {
        return fs.readFileSync(filePath, "utf8");
    }

    if (extension === ".json") {
        const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
        return JSON.stringify(data, null, 2);
    }

    throw new Error("Unsupported file type. Use TXT, Markdown or JSON.");
}

function ingestDocument({
    filePath,
    title,
    category,
    source,
    version = "1.0",
    status = "APPROVED"
}) {
    const rawText = readDocument(filePath);
    const cleanedText = cleanText(rawText);
    const chunks = splitIntoChunks(cleanedText);

    db.run(
        `INSERT INTO KnowledgeDocuments
        (title, category, content, source, version, status)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [title, category, cleanedText, source, version, status],
        function (err) {
            if (err) {
                console.error("Document insert failed:", err.message);
                return;
            }

            const documentId = this.lastID;

            const stmt = db.prepare(`
                INSERT INTO KnowledgeChunks
                (document_id, chunk_index, title, category, section,
                 version, source, status, content)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            chunks.forEach((chunk, index) => {
                stmt.run(
                    documentId,
                    index,
                    title,
                    category,
                    `Section ${index + 1}`,
                    version,
                    source,
                    status,
                    chunk
                );
            });

            stmt.finalize();

            console.log(
                `Ingested "${title}" with ${chunks.length} knowledge chunks.`
            );
        }
    );
}

module.exports = {
    ingestDocument,
    cleanText,
    splitIntoChunks,
    readDocument
};