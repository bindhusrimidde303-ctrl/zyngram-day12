const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", (req, res) => {
    db.all(
        `SELECT *
         FROM ProductionLogs
         ORDER BY timestamp DESC
         LIMIT 50`,
        [],
        (err, rows) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Unable to load production logs."
                });
            }

            res.json({
                success: true,
                logs: rows
            });
        }
    );
});

router.post("/", (req, res) => {
    const {
        user_id,
        action,
        module,
        status,
        error,
        request_id
    } = req.body;

    if (!action || !module || !status) {
        return res.status(400).json({
            success: false,
            message: "action, module and status are required."
        });
    }

    db.run(
        `INSERT INTO ProductionLogs
        (user_id, action, module, status, error, request_id)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
            user_id || "system",
            action,
            module,
            status,
            error || null,
            request_id || `REQ-${Date.now()}`
        ],
        function (err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Unable to create production log."
                });
            }

            res.json({
                success: true,
                logId: this.lastID
            });
        }
    );
});

module.exports = router;