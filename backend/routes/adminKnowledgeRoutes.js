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
        SELECT
            id,
            title,
            category,
            source,
            version,
            status,
            created_at,
            updated_at
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

        res.json({
            success: true,
            documents: rows
        });
    });
});

// Add a knowledge document
router.post("/documents", (req, res) => {
    const {
        title,
        category,
        content,
        source,
        version
    } = req.body;

    if (!title || !category || !content || !version) {
        return res.status(400).json({
            success: false,
            message: "Title, category, content and version are required."
        });
    }

    const sql = `
        INSERT INTO KnowledgeDocuments
        (title, category, content, source, version, status)
        VALUES (?, ?, ?, ?, ?, 'DRAFT')
    `;

    db.run(
        sql,
        [
            title,
            category,
            content,
            source || "Admin Entry",
            version
        ],
        function (err) {
            if (err) {
                console.error("Knowledge insert error:", err.message);

                return res.status(500).json({
                    success: false,
                    message: "Unable to add knowledge document."
                });
            }

            res.status(201).json({
                success: true,
                message: "Knowledge document created as DRAFT.",
                documentId: this.lastID
            });
        }
    );
});

// Change document status
router.patch("/documents/:id/status", (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    const allowedStatuses = [
        "DRAFT",
        "APPROVED",
        "ARCHIVED"
    ];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid status."
        });
    }

    db.run(
        `
        UPDATE KnowledgeDocuments
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        `,
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
                `
                UPDATE KnowledgeChunks
                SET status = ?
                WHERE document_id = ?
                `,
                [status, id],
                (chunkError) => {
                    if (chunkError) {
                        console.error(
                            "Chunk status update error:",
                            chunkError.message
                        );
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

module.exports = router;