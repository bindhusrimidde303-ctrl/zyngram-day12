const db = require("./db");

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS ProductionLogs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            user_id TEXT,
            action TEXT NOT NULL,
            module TEXT NOT NULL,
            status TEXT NOT NULL,
            error TEXT,
            request_id TEXT
        )
    `);

    console.log("Production logs table is ready.");
});

setTimeout(() => {
    db.close();
}, 500);