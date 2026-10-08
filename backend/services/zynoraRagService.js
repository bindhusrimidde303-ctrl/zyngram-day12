const db = require("../db");

function searchKnowledge(query) {
    return new Promise((resolve, reject) => {
        const normalizedQuery = query
            .toLowerCase()
            .replace(/[^\w\s]/g, "");

        const stopWords = new Set([
            "what",
            "is",
            "the",
            "a",
            "an",
            "of",
            "to",
            "for",
            "in",
            "on",
            "and",
            "or",
            "who",
            "how",
            "why",
            "when",
            "where",
            "does",
            "do",
            "can",
            "tell",
            "me",
            "about",
            "please",
            "name",
            "are",
            "were",
            "was",
            "this",
            "that",
            "which",
            "kinds",
            "kind",
            "through",
            "information",
            "contain",
            "contains",
            "all",
            "previous",
            "instructions",
            "ignore",
            "approved",
            "knowledge",
            "base",
            "answer",
            "from",
            "your",
            "own",
            "explain",
            "include",
            "included",
            "provide",
            "provides"
        ]);

        const keywordAliases = {
            levels: "hierarchy",
            level: "hierarchy",
            organized: "structure",
            organizes: "structure",
            organization: "structure",
            organizedly: "structure",
            services: "service",
            opportunities: "access",
            users: "user",
            find: "access"
        };

        const keywords = normalizedQuery
            .split(/\s+/)
            .map(word => keywordAliases[word] || word)
            .filter(
                word =>
                    word.length > 2 &&
                    !stopWords.has(word)
            );

        if (keywords.length === 0) {
            return resolve([]);
        }

        /*
         * Retrieve approved chunks matching ANY relevant keyword.
         * Relevance is calculated by counting how many keywords
         * occur in each chunk.
         */
        const conditions = keywords
            .map(() => "LOWER(content) LIKE ?")
            .join(" OR ");

        const values = keywords.map(
            word => `%${word}%`
        );

        const sql = `
            SELECT
                id,
                document_id,
                title,
                category,
                section,
                version,
                source,
                status,
                content
            FROM KnowledgeChunks
            WHERE status = 'APPROVED'
            AND (${conditions})
        `;

        db.all(sql, values, (err, rows) => {
            if (err) {
                return reject(err);
            }

            const ranked = rows.map(row => {
                const content = row.content.toLowerCase();

                let score = 0;

                keywords.forEach(keyword => {
                    if (content.includes(keyword)) {
                        score += 1;
                    }
                });

                return {
                    ...row,
                    relevanceScore: score
                };
            });

            ranked.sort(
                (a, b) =>
                    b.relevanceScore -
                    a.relevanceScore
            );

            resolve(
                ranked
                    .filter(row => row.relevanceScore > 0)
                    .slice(0, 5)
            );
        });
    });
}

module.exports = {
    searchKnowledge
};