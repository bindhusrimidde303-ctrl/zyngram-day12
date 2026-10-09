```javascript
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
        // Conversations
        db.run(`
            CREATE TABLE IF NOT EXISTS Conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                title TEXT NOT NULL DEFAULT 'New Conversation',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Messages
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

        // Message sources
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

        // AI response evaluations
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
        `);

        // Production logs
        db.run(`
            CREATE TABLE IF NOT EXISTS ProductionLogs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
                user_id TEXT,
                action TEXT,
                module TEXT,
                status TEXT,
                error TEXT,
                request_id TEXT
            )
        `);

        // Knowledge documents
        db.run(`
            CREATE TABLE IF NOT EXISTS KnowledgeDocuments (
                id INTEGER PRIMARY KEY,
                title VARCHAR(200) NOT NULL,
                category VARCHAR(100) NOT NULL,
                content TEXT NOT NULL,
                source VARCHAR(255),
                version VARCHAR(50) NOT NULL,
                status VARCHAR(30) DEFAULT 'DRAFT',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Knowledge chunks
        db.run(`
            CREATE TABLE IF NOT EXISTS KnowledgeChunks (
                id INTEGER PRIMARY KEY,
                document_id INTEGER NOT NULL,
                chunk_index INTEGER NOT NULL,
                title VARCHAR(200),
                category VARCHAR(100),
                section VARCHAR(200),
                version VARCHAR(50),
                source VARCHAR(255),
                status VARCHAR(30) DEFAULT 'DRAFT',
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (document_id) REFERENCES KnowledgeDocuments(id)
            )
        `);

        // Verify database tables
        db.all(
            `SELECT name
             FROM sqlite_master
             WHERE type = 'table'
             AND name IN (
                'Conversations',
                'Messages',
                'MessageSources',
                'AIResponseEvaluations',
                'ProductionLogs',
                'KnowledgeDocuments',
                'KnowledgeChunks'
             )
             ORDER BY name`,
            [],
            (verifyErr, rows) => {
                if (verifyErr) {
                    console.error(
                        "Database table verification failed:",
                        verifyErr.message
                    );
                } else {
                    console.log(
                        "Database tables verified:",
                        rows.map((row) => row.name)
                    );
                }
            }
        );
    });
});

module.exports = db;
```