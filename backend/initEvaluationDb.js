const db = require("./db");

db.serialize(() => {
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
            FOREIGN KEY (conversation_id)
                REFERENCES Conversations(id),
            FOREIGN KEY (message_id)
                REFERENCES Messages(id)
        )
    `);

    console.log("AI response evaluation table is ready.");
});

setTimeout(() => {
    db.close();
}, 500);