const db = require("./db");

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS Conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id VARCHAR(100) NOT NULL,
            title VARCHAR(200) DEFAULT 'New Conversation',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS Messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id INTEGER NOT NULL,
            role VARCHAR(20) NOT NULL,
            content TEXT NOT NULL,
            grounded INTEGER DEFAULT 0,
            response_time_ms INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (conversation_id)
                REFERENCES Conversations(id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS MessageSources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message_id INTEGER NOT NULL,
            title VARCHAR(200),
            category VARCHAR(100),
            version VARCHAR(50),
            source VARCHAR(255),
            relevance_score REAL,
            FOREIGN KEY (message_id)
                REFERENCES Messages(id)
        )
    `);

    console.log("Day 12 conversation tables are ready.");
});

setTimeout(() => {
    db.close();
}, 500);