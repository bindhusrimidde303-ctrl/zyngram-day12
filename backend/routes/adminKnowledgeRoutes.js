
const express = require("express");
const db = require("../db");

const router = express.Router();

function requireAdmin(req, res, next) {
    const token = req.headers.authorization;

    if (token !== "Bearer admin-demo-token") {
        return res.status(401).json({
            success: false,
            message: "Unauthorized access."
        });
    }

    next();
}

router.use(requireAdmin);
router.use(express.json());

// Get all knowledge documents
router.get("/documents", (req, res) => {
    const sql = `
        SELECT id, title, category, source, version,
               status, created_at, updated_at
        FROM KnowledgeDocuments
        ORDER BY id DESC
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("Knowledge documents error:", err.message);
            return res.status(500).json({
                success: false,
                message: "Unable to load knowledge documents."
            });
        }

        res.json({ success: true, documents: rows });
    });
});

// Add a knowledge document and create searchable chunks
router.post("/documents", (req, res) => {
    const { title, category, content, source, version } = req.body;

    if (!title || !category || !content || !version) {
        return res.status(400).json({
            success: false,
            message: "Title, category, content and version are required."
        });
    }

    const words = content.trim().split(/\s+/);
    const chunks = [];

    for (let i = 0; i < words.length; i += 500) {
        chunks.push(words.slice(i, i + 500).join(" "));
    }

    db.run(
        `INSERT INTO KnowledgeDocuments
         (title, category, content, source, version, status)
         VALUES (?, ?, ?, ?, ?, 'DRAFT')`,
        [title, category, content, source || "Admin Entry", version],
        function (err) {
            if (err) {
                console.error("Knowledge insert error:", err.message);
                return res.status(500).json({
                    success: false,
                    message: "Unable to add knowledge document."
                });
            }

            const documentId = this.lastID;

            db.serialize(() => {
                db.run("BEGIN TRANSACTION");

                const stmt = db.prepare(`
                    INSERT INTO KnowledgeChunks
                    (document_id, chunk_index, title, category, section,
                     version, source, status, content)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?)
                `);

                chunks.forEach((chunk, index) => {
                    stmt.run([
                        documentId,
                        index,
                        title,
                        category,
                        `Section ${index + 1}`,
                        version,
                        source || "Admin Entry",
                        chunk
                    ]);
                });

                stmt.finalize((chunkErr) => {
                    if (chunkErr) {
                        console.error("Chunk insert error:", chunkErr.message);
                        return db.run("ROLLBACK", () => {
                            res.status(500).json({
                                success: false,
                                message: "Unable to create knowledge chunks."
                            });
                        });
                    }

                    db.run("COMMIT", (commitErr) => {
                        if (commitErr) {
                            console.error("Commit error:", commitErr.message);
                            return res.status(500).json({
                                success: false,
                                message: "Unable to save knowledge chunks."
                            });
                        }

                        res.status(201).json({
                            success: true,
                            message: "Knowledge document and chunks created as DRAFT.",
                            documentId,
                            chunksCreated: chunks.length
                        });
                    });
                });
            });
        }
    );
});

// Change document and chunk status
router.patch("/documents/:id/status", (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    const allowedStatuses = ["DRAFT", "APPROVED", "ARCHIVED"];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid status."
        });
    }

    db.run(
        `UPDATE KnowledgeDocuments
         SET status = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [status, id],
        function (err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Unable to update document status."
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Knowledge document not found."
                });
            }

            db.run(
                `UPDATE KnowledgeChunks SET status = ?
                 WHERE document_id = ?`,
                [status, id],
                (chunkError) => {
                    if (chunkError) {
                        console.error("Chunk status update error:", chunkError.message);
                        return res.status(500).json({
                            success: false,
                            message: "Document status updated, but chunk status update failed."
                        });
                    }

                    res.json({
                        success: true,
                        message: `Document status changed to ${status}.`
                    });
                }
            );
        }
    );
});
// Repair missing chunks for an existing knowledge document
router.post("/documents/:id/rebuild-chunks", (req, res) => {
    const documentId = req.params.id;

    db.get(
        `SELECT id, title, category, content, source, version, status
         FROM KnowledgeDocuments
         WHERE id = ?`,
        [documentId],
        (err, document) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Unable to read knowledge document."
                });
            }

            if (!document) {
                return res.status(404).json({
                    success: false,
                    message: "Knowledge document not found."
                });
            }

            db.get(
                `SELECT COUNT(*) AS count
                 FROM KnowledgeChunks
                 WHERE document_id = ?`,
                [documentId],
                (countErr, row) => {
                    if (countErr) {
                        return res.status(500).json({
                            success: false,
                            message: "Unable to check existing chunks."
                        });
                    }

                    if (row.count > 0) {
                        return res.status(409).json({
                            success: false,
                            message: "Chunks already exist. No changes made.",
                            chunksFound: row.count
                        });
                    }

                    const words = document.content.trim().split(/\s+/);
                    const chunks = [];

                    for (let i = 0; i < words.length; i += 500) {
                        chunks.push(words.slice(i, i + 500).join(" "));
                    }

                    const stmt = db.prepare(`
                        INSERT INTO KnowledgeChunks
                        (document_id, chunk_index, title, category, section,
                         version, source, status, content)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `);

                    let index = 0;

                    function insertNext() {
                        if (index >= chunks.length) {
                            return stmt.finalize((finalizeErr) => {
                                if (finalizeErr) {
                                    return res.status(500).json({
                                        success: false,
                                        message: "Unable to finish creating chunks."
                                    });
                                }

                                res.json({
                                    success: true,
                                    documentId: document.id,
                                    chunksCreated: chunks.length,
                                    status: document.status
                                });
                            });
                        }

                        const chunkIndex = index++;

                        stmt.run(
                            document.id,
                            chunkIndex,
                            document.title,
                            document.category,
                            `Section ${chunkIndex + 1}`,
                            document.version,
                            document.source,
                            document.status,
                            chunks[chunkIndex],
                            (insertErr) => {
                                if (insertErr) {
                                    return stmt.finalize(() => {
                                        res.status(500).json({
                                            success: false,
                                            message: "Unable to create knowledge chunks."
                                        });
                                    });
                                }

                                insertNext();
                            }
                        );
                    }

                    insertNext();
                }
            );
        }
    );
});


module.exports = router;
