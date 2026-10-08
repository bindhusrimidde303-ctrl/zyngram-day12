const { searchKnowledge } = require("./services/zynoraRagService");

async function test() {
    try {
        const results = await searchKnowledge("What is Zyngram?");

        console.log("RAG RESULTS:");
        console.log(JSON.stringify(results, null, 2));

        process.exit(0);
    } catch (error) {
        console.error("RAG test failed:", error.message);
        process.exit(1);
    }
}

test();