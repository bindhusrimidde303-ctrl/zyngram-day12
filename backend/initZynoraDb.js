const db = require("./db");

db.serialize(() => {
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

    console.log("Zynora Knowledge Base tables are ready.");
});

db.close();