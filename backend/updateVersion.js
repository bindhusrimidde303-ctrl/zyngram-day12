const db = require("./db");

db.serialize(() => {
    db.run(
        "UPDATE KnowledgeDocuments SET version = '2.0'",
        function (err) {
            if (err) {
                console.error(err.message);
            } else {
                console.log("KnowledgeDocuments updated:", this.changes);
            }
        }
    );

    db.run(
        "UPDATE KnowledgeChunks SET version = '2.0'",
        function (err) {
            if (err) {
                console.error(err.message);
            } else {
                console.log("KnowledgeChunks updated:", this.changes);
            }
        }
    );

    db.run(
        "UPDATE MessageSources SET version = '2.0'",
        function (err) {
            if (err) {
                console.error(err.message);
            } else {
                console.log("MessageSources updated:", this.changes);
            }
        }
    );
});

setTimeout(() => {
    db.close();
}, 500);