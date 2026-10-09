const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "..", "database", "zynora.db");

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Database connection failed:", err.message);
        return;
    }

    console.log("Zynora SQLite database connected.");

    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS Conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                title TEXT NOT NULL DEFAULT 'New Conversation',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS Messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                conversation_id INTEGER NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                grounded INTEGER DEFAULT 0,
                response_time_ms INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (conversation_id)
                    REFERENCES Conversations(id)
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS MessageSources (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                message_id INTEGER NOT NULL,
                title TEXT,
                category TEXT,
                version TEXT,
                source TEXT,
                relevance_score REAL,
                FOREIGN KEY (message_id) REFERENCES Messages(id)
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS AIResponseEvaluations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                conversation_id INTEGER,
                message_id INTEGER,
                question TEXT NOT NULL,
                retrieved_chunks INTEGER DEFAULT 0,
                relevance_score REAL DEFAULT 0,
                answer TEXT,
                source TEXT,
                response_time_ms INTEGER,
                grounded INTEGER DEFAULT 0,
                confidence REAL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (conversation_id) REFERENCES Conversations(id),
                FOREIGN KEY (message_id) REFERENCES Messages(id)
            )
        `, (tableError) => {
            if (tableError) {
                console.error(
                    "AIResponseEvaluations table creation failed:",
                    tableError.message
                );
            } else {
                console.log("AIResponseEvaluations table ready.");
            }
        });

        db.each(
            `SELECT name FROM sqlite_master
             WHERE type = 'table'
             AND name IN (
                 'Conversations',
                 'Messages',
                 'MessageSources',
                 'AIResponseEvaluations'
             )`,
            (err, row) => {
                if (err) {
                    console.error("Table verification failed:", err.message);
                } else {
                    console.log("Database table ready:", row.name);
                }
            }
        );
    });
});

module.exports = db;