const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/summary", (req, res) => {
    const { from, to } = req.query;

    let messageDateCondition = "";
    let conversationDateCondition = "";
    let evaluationDateCondition = "";
    let logDateCondition = "";

    const messageParams = [];
    const conversationParams = [];
    const evaluationParams = [];
    const logParams = [];

    if (from && to) {
        messageDateCondition = `AND DATE(created_at) BETWEEN DATE(?) AND DATE(?)`;
        conversationDateCondition = `AND DATE(created_at) BETWEEN DATE(?) AND DATE(?)`;
        evaluationDateCondition = `AND DATE(created_at) BETWEEN DATE(?) AND DATE(?)`;
        logDateCondition = `AND DATE(timestamp) BETWEEN DATE(?) AND DATE(?)`;

        messageParams.push(from, to);
        conversationParams.push(from, to);
        evaluationParams.push(from, to);
        logParams.push(from, to);
    } else if (from) {
        messageDateCondition = `AND DATE(created_at) >= DATE(?)`;
        conversationDateCondition = `AND DATE(created_at) >= DATE(?)`;
        evaluationDateCondition = `AND DATE(created_at) >= DATE(?)`;
        logDateCondition = `AND DATE(timestamp) >= DATE(?)`;

        messageParams.push(from);
        conversationParams.push(from);
        evaluationParams.push(from);
        logParams.push(from);
    } else if (to) {
        messageDateCondition = `AND DATE(created_at) <= DATE(?)`;
        conversationDateCondition = `AND DATE(created_at) <= DATE(?)`;
        evaluationDateCondition = `AND DATE(created_at) <= DATE(?)`;
        logDateCondition = `AND DATE(timestamp) <= DATE(?)`;

        messageParams.push(to);
        conversationParams.push(to);
        evaluationParams.push(to);
        logParams.push(to);
    }

    const queries = {
        conversations: {
            sql: `
                SELECT COUNT(*) AS count
                FROM Conversations
                WHERE 1=1 ${conversationDateCondition}
            `,
            params: conversationParams
        },

        questions: {
            sql: `
                SELECT COUNT(*) AS count
                FROM Messages
                WHERE role = 'user' ${messageDateCondition}
            `,
            params: messageParams
        },

        successfulAnswers: {
            sql: `
                SELECT COUNT(*) AS count
                FROM Messages
                WHERE role = 'assistant'
                AND grounded = 1
                ${messageDateCondition}
            `,
            params: messageParams
        },

        noAnswers: {
            sql: `
                SELECT COUNT(*) AS count
                FROM Messages
                WHERE role = 'assistant'
                AND grounded = 0
                ${messageDateCondition}
            `,
            params: messageParams
        },

        averageResponseTime: {
            sql: `
                SELECT ROUND(AVG(response_time_ms), 2) AS average
                FROM Messages
                WHERE role = 'assistant'
                AND response_time_ms IS NOT NULL
                ${messageDateCondition}
            `,
            params: messageParams
        },

        evaluations: {
            sql: `
                SELECT COUNT(*) AS count
                FROM AIResponseEvaluations
                WHERE 1=1 ${evaluationDateCondition}
            `,
            params: evaluationParams
        },

        errors: {
            sql: `
                SELECT COUNT(*) AS count
                FROM ProductionLogs
                WHERE status = 'ERROR'
                ${logDateCondition}
            `,
            params: logParams
        },

        authFailures: {
            sql: `
                SELECT COUNT(*) AS count
                FROM ProductionLogs
                WHERE action = 'AUTH_FAILURE'
                ${logDateCondition}
            `,
            params: logParams
        },

        retrievalFailures: {
            sql: `
                SELECT COUNT(*) AS count
                FROM ProductionLogs
                WHERE action = 'RETRIEVAL'
                AND status = 'ERROR'
                ${logDateCondition}
            `,
            params: logParams
        }
    };

    db.get(
        queries.conversations.sql,
        queries.conversations.params,
        (err, conversationRow) => {
            if (err) {
                console.error("Monitoring conversations error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Unable to load monitoring data."
                });
            }

            db.get(
                queries.questions.sql,
                queries.questions.params,
                (err, questionRow) => {
                    if (err) {
                        console.error("Monitoring questions error:", err);
                        return res.status(500).json({
                            success: false,
                            message: "Unable to load monitoring data."
                        });
                    }

                    db.get(
                        queries.successfulAnswers.sql,
                        queries.successfulAnswers.params,
                        (err, successRow) => {
                            if (err) {
                                console.error("Monitoring successful answers error:", err);
                                return res.status(500).json({
                                    success: false,
                                    message: "Unable to load monitoring data."
                                });
                            }

                            db.get(
                                queries.noAnswers.sql,
                                queries.noAnswers.params,
                                (err, noAnswerRow) => {
                                    if (err) {
                                        console.error("Monitoring no-answer error:", err);
                                        return res.status(500).json({
                                            success: false,
                                            message: "Unable to load monitoring data."
                                        });
                                    }

                                    db.get(
                                        queries.averageResponseTime.sql,
                                        queries.averageResponseTime.params,
                                        (err, timeRow) => {
                                            if (err) {
                                                console.error("Monitoring response time error:", err);
                                                return res.status(500).json({
                                                    success: false,
                                                    message: "Unable to load monitoring data."
                                                });
                                            }

                                            db.get(
                                                queries.evaluations.sql,
                                                queries.evaluations.params,
                                                (err, evaluationRow) => {
                                                    if (err) {
                                                        console.error("Monitoring evaluations error:", err);
                                                        return res.status(500).json({
                                                            success: false,
                                                            message: "Unable to load monitoring data."
                                                        });
                                                    }

                                                    db.get(
                                                        queries.errors.sql,
                                                        queries.errors.params,
                                                        (err, errorRow) => {
                                                            if (err) {
                                                                console.error("Monitoring errors query error:", err);
                                                                return res.status(500).json({
                                                                    success: false,
                                                                    message: "Unable to load monitoring data."
                                                                });
                                                            }

                                                            db.get(
                                                                queries.authFailures.sql,
                                                                queries.authFailures.params,
                                                                (err, authRow) => {
                                                                    if (err) {
                                                                        console.error("Monitoring auth query error:", err);
                                                                        return res.status(500).json({
                                                                            success: false,
                                                                            message: "Unable to load monitoring data."
                                                                        });
                                                                    }

                                                                    db.get(
                                                                        queries.retrievalFailures.sql,
                                                                        queries.retrievalFailures.params,
                                                                        (err, retrievalRow) => {
                                                                            if (err) {
                                                                                console.error("Monitoring retrieval query error:", err);
                                                                                return res.status(500).json({
                                                                                    success: false,
                                                                                    message: "Unable to load monitoring data."
                                                                                });
                                                                            }

                                                                            const categoryQuery = `
                                                                                SELECT category, COUNT(*) AS count
                                                                                FROM KnowledgeDocuments
                                                                                WHERE status = 'APPROVED'
                                                                                GROUP BY category
                                                                                ORDER BY count DESC
                                                                            `;

                                                                            db.all(
                                                                                categoryQuery,
                                                                                [],
                                                                                (err, categoryRows) => {
                                                                                    if (err) {
                                                                                        console.error("Monitoring categories error:", err);
                                                                                        return res.status(500).json({
                                                                                            success: false,
                                                                                            message: "Unable to load monitoring data."
                                                                                        });
                                                                                    }

                                                                                    res.json({
                                                                                        success: true,
                                                                                        filter: {
                                                                                            from: from || null,
                                                                                            to: to || null
                                                                                        },
                                                                                        monitoring: {
                                                                                            conversations: conversationRow.count,
                                                                                            questions: questionRow.count,
                                                                                            successfulAnswers: successRow.count,
                                                                                            noAnswers: noAnswerRow.count,
                                                                                            averageResponseTimeMs: timeRow.average || 0,
                                                                                            evaluations: evaluationRow.count,
                                                                                            errors: errorRow.count,
                                                                                            authFailures: authRow.count,
                                                                                            retrievalFailures: retrievalRow.count,
                                                                                            aiServiceHealth: "HEALTHY",
                                                                                            categories: categoryRows
                                                                                        }
                                                                                    });
                                                                                }
                                                                            );
                                                                        }
                                                                    );
                                                                }
                                                            );
                                                        }
                                                    );
                                                }
                                            );
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});

module.exports = router;