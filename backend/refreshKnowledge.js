const db = require("./db");
const fs = require("fs");
const path = require("path");

const filePath = path.join(
    __dirname,
    "knowledge",
    "zyngram-overview.txt"
);

const content = fs.readFileSync(filePath, "utf8").trim();

db.get(
    `SELECT id FROM KnowledgeDocuments
     WHERE source = ?`,
    ["zyngram-overview.txt"],
    (err, document) => {
        if (err) {
            console.error("Document lookup failed:", err.message);
            return;
        }

        if (!document) {
            console.error("Existing Zyngram knowledge document not found.");
            return;
        }

        const documentId = document.id;

        db.run(
            `UPDATE KnowledgeDocuments
             SET content = ?, version = '2.0',
                 status = 'APPROVED',
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [content, documentId],
            function (err) {
                if (err) {
                    console.error("Document update failed:", err.message);
                    return;
                }

                db.run(
                    `DELETE FROM KnowledgeChunks
                     WHERE document_id = ?`,
                    [documentId],
                    function (err) {
                        if (err) {
                            console.error(
                                "Old chunks deletion failed:",
                                err.message
                            );
                            return;
                        }

                        const chunks = content
                            .split(/\s+/)
                            .reduce((result, word, index) => {
                                const chunkIndex = Math.floor(index / 500);

                                if (!result[chunkIndex]) {
                                    result[chunkIndex] = [];
                                }

                                result[chunkIndex].push(word);
                                return result;
                            }, [])
                            .map(words => words.join(" "));

                        const stmt = db.prepare(`
                            INSERT INTO KnowledgeChunks
                            (
                                document_id,
                                chunk_index,
                                title,
                                category,
                                section,
                                version,
                                source,
                                status,
                                content
                            )
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `);

                        chunks.forEach((chunk, index) => {
                            stmt.run(
                                documentId,
                                index,
                                "Zyngram Overview",
                                "Company",
                                `Section ${index + 1}`,
                                "2.0",
                                "zyngram-overview.txt",
                                "APPROVED",
                                chunk
                            );
                        });

                        stmt.finalize(() => {
                            console.log(
                                "Zyngram knowledge successfully refreshed."
                            );
                            console.log(
                                "Existing document updated to Version 2.0."
                            );
                            console.log(
                                `Knowledge chunks created: ${chunks.length}`
                            );
                        });
                    }
                );
            }
        );
    }
);