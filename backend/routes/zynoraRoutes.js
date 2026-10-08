const express = require("express");
const router = express.Router();

const { searchKnowledge } = require("../services/zynoraRagService");
const db = require("../db");

// --------------------------------------------------
// Helper: Run SQLite query
// --------------------------------------------------
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
}

// --------------------------------------------------
// Helper: Get SQLite rows
// --------------------------------------------------
function getRows(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// --------------------------------------------------
// Save AI evaluation
// --------------------------------------------------
async function saveEvaluation(
  conversationId,
  question,
  answer,
  grounded,
  confidence
) {
  try {
    await runQuery(
      `
      INSERT INTO AIResponseEvaluations
      (
        conversation_id,
        question,
        answer,
        grounded,
        confidence
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        conversationId,
        question,
        answer,
        grounded ? 1 : 0,
        confidence
      ]
    );
  } catch (error) {
    console.error("Evaluation save error:", error.message);
  }
}
// --------------------------------------------------
// Extract specific section from approved knowledge
// --------------------------------------------------

// --------------------------------------------------
// Extract specific section from approved knowledge
// --------------------------------------------------
function extractKnowledgeSection(content, section) {
  if (!content) {
    return null;
  }

  const text = content.replace(/\r\n/g, "\n");

  if (section === "vision") {
    const match = text.match(
      /Our Vision\s*(.*?)(?=Our Mission)/is
    );

    if (match) {
      return match[1].trim();
    }

    return null;
  }

  if (section === "mission") {
    const match = text.match(
      /Our Mission\s*(.*?)(?=Zyngram includes a franchise)/is
    );

    if (match) {
      return match[1].trim();
    }

    return null;
  }

  if (section === "policies") {
    const match = text.match(
      /Approved policies included in the Zyngram knowledge base are:\s*(.*?)(?=Zynora is the official)/is
    );

    if (match) {
      return match[1].trim();
    }

    return null;
  }

  return null;
}

// --------------------------------------------------
// POST /api/zynora/chat
// --------------------------------------------------
router.post("/chat", async (req, res) => {
  const startTime = Date.now();

  try {
    const { message, conversationId } = req.body;

    // ----------------------------------------------
    // Validate request
    // ----------------------------------------------
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required"
      });
    }
  
    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required"
      });
    }

    // ----------------------------------------------
    // Verify conversation
    // ----------------------------------------------
    const conversation = await getRows(
      `
      SELECT *
      FROM conversations
      WHERE id = ?
      `,
      [conversationId]
    );

    if (!conversation.length) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found"
      });
    }

    // ----------------------------------------------
    // Save user message
    // ----------------------------------------------
    await runQuery(
      `
      INSERT INTO messages
      (
        conversation_id,
        role,
        content
      )
      VALUES (?, ?, ?)
      `,
      [
        conversationId,
        "user",
        message.trim()
      ]
    );

    // ----------------------------------------------
    // Get previous conversation messages
    // ----------------------------------------------
    const previousMessages = await getRows(
      `
      SELECT role, content
      FROM messages
      WHERE conversation_id = ?
      ORDER BY id DESC
      LIMIT 6
      `,
      [conversationId]
    );

    previousMessages.reverse();

    // ----------------------------------------------
    // Build conversation context
    // ----------------------------------------------
    const context = previousMessages
      .map((item) => `${item.role}: ${item.content}`)
      .join("\n");

    // ----------------------------------------------
    // Search approved knowledge
    // ----------------------------------------------
    let results = await searchKnowledge(message);

    // ----------------------------------------------
    // Context-aware follow-up handling
    // ----------------------------------------------
    const lowerMessage = message.toLowerCase();

    const isServiceFollowUp =
      /\b(it|they|them|this|that|what about|does it include)\b/i.test(
        message
      ) &&
      /\b(logistics|food|recharge|utility|e-commerce|jobs|freelancing)\b/i.test(
        message
      );

    if (isServiceFollowUp && context) {
      const serviceResults = await searchKnowledge(
        `${context} ${message}`
      );

      if (serviceResults.length) {
        results = serviceResults;
      }
    }

    // ----------------------------------------------
    // Intent detection
    // ----------------------------------------------
    const isVisionQuestion =
      /\bvision\b/i.test(message);

    const isMissionQuestion =
      /\bmission\b/i.test(message);

    const isPoliciesQuestion =
      /\b(policy|policies|guidelines|code of conduct|promotional guidelines)\b/i.test(
        message
      );

    const isPhysicalHierarchyQuestion =
      /\bphysical\b/i.test(message) &&
      /\b(franchise|hierarchy|structure|levels)\b/i.test(message);

    const isDigitalHierarchyQuestion =
      /\bdigital\b/i.test(message) &&
      /\b(franchise|hierarchy|structure|network|levels|organized|organised)\b/i.test(
        message
      );

    const isDigitalNetworkOrganizationQuestion =
      /\bdigital\b/i.test(message) &&
      /\b(network|franchise)\b/i.test(message) &&
      /\b(organized|organised|structure|structured)\b/i.test(
        message
      );

    const isJobsFreelancingQuestion =
      /\b(job|jobs|freelancing|freelance|employment|work opportunities|opportunities)\b/i.test(
        message
      );

   const isFranchiseTypesQuestion =
  /\b(franchise types|types of franchise)\b/i.test(message);
  const isCommandHqNodeQuestion =
  /\b(command|hq|digital node|node)\b/i.test(message) &&
  /\b(franchise|structure|hierarchy|levels)\b/i.test(message);
  const isPointCenterHubQuestion =
  /\b(point|center|hub)\b/i.test(message) &&
  /\b(franchise|structure|hierarchy|levels)\b/i.test(message);
  const isFranchiseStructureInformationQuestion =
      /\b(franchise|franchise structure)\b/i.test(message) &&
      /\b(information|contain|contains|include|includes|structure)\b/i.test(
        message
      );

    const isServicesQuestion =
      /\b(service|services)\b/i.test(message);

    const isZynoraQuestion =
      /\bzynora\b/i.test(message);

    // ----------------------------------------------
    // If no knowledge found
    // ----------------------------------------------
    if (!results || results.length === 0) {
      const fallback =
        "I couldn't find this information in the approved Zyngram knowledge base.";

      await runQuery(
        `
        INSERT INTO messages
        (
          conversation_id,
          role,
          content
        )
        VALUES (?, ?, ?)
        `,
        [
          conversationId,
          "assistant",
          fallback
        ]
      );

      await saveEvaluation(
        conversationId,
        message,
        fallback,
        false,
        0
      );

      return res.json({
        success: true,
        answer: fallback,
        grounded: false,
        sources: [],
        responseTimeMs: Date.now() - startTime
      });
    }

    // ----------------------------------------------
    // Best approved result
    // ----------------------------------------------
    const best = results[0];

    let answer = best.content;

    // ----------------------------------------------
    // Specific answer: Vision
    // ----------------------------------------------
    if (isVisionQuestion) {
      const vision = extractKnowledgeSection(
        best.content,
        "vision"
      );

      if (vision) {
        answer = `Zyngram's vision is: ${vision}`;
      }
    }

    // ----------------------------------------------
    // Specific answer: Mission
    // ----------------------------------------------
    else if (isMissionQuestion) {
      const mission = extractKnowledgeSection(
        best.content,
        "mission"
      );

      if (mission) {
        answer = `Zyngram's mission is: ${mission}`;
      }
    }

    // ----------------------------------------------
    // Specific answer: Policies
    // ----------------------------------------------
    else if (isPoliciesQuestion) {
      const policies = extractKnowledgeSection(
        best.content,
        "policies"
      );

      if (policies) {
        const policyList = policies
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean)
          .join("; ");

        answer =
          `Approved policies included in the Zyngram knowledge base are: ${policyList}.`;
      }
    }

    // ----------------------------------------------
    // Zynora question
    // ----------------------------------------------
    else if (isZynoraQuestion) {
      answer =
        "Zynora is the official internal Zyngram knowledge chatbot. Zynora answers questions only from approved Zyngram knowledge content.";
    }

    // ----------------------------------------------
    // Physical franchise hierarchy
    // ----------------------------------------------
    else if (isPhysicalHierarchyQuestion) {
      answer =
        "The physical Zyngram franchise hierarchy is: Point → Center → Hub → Command → HQ.";
    }

    // ----------------------------------------------
    // Digital franchise hierarchy
    // ----------------------------------------------
   else if (isCommandHqNodeQuestion) {
  answer =
    "Command and HQ are physical franchise levels in the hierarchy Point → Center → Hub → Command → HQ. Digital Node is the first level of the digital franchise hierarchy Node → Zone → Territory → Region → Nation.";
}
 else if (
      isDigitalHierarchyQuestion ||
      isDigitalNetworkOrganizationQuestion
    ) {
      answer =
        "The digital Zyngram franchise network is organized as: Node → Zone → Territory → Region → Nation.";
    }

    // ----------------------------------------------
    // Franchise structure information
    // ----------------------------------------------
   else if (isPointCenterHubQuestion) {
  answer =
    "Point → Center → Hub are the first three levels of the physical Zyngram franchise hierarchy.";
}

   // --------------------------------------------------
// Jobs / Freelancing
// --------------------------------------------------

else if (isJobsFreelancingQuestion) {
  answer =
    "Approved Zyngram service categories include jobs and freelancing services.";
}

// --------------------------------------------------
// Service follow-up question
// --------------------------------------------------

else if (isServiceFollowUp) {
  if (/\blogistics\b/i.test(message)) {
    answer =
      "Yes. Logistics is one of the approved Zyngram service categories.";
  } else if (/\bfood\b/i.test(message)) {
    answer =
      "Yes. Food delivery is one of the approved Zyngram service categories.";
  } else if (/\brecharge\b/i.test(message)) {
    answer =
      "Yes. Mobile Recharge is one of the approved Zyngram service categories.";
  } else if (/\butility\b/i.test(message)) {
    answer =
      "Yes. Utility services are included in the approved Zyngram service categories.";
  } else if (/\be-commerce\b/i.test(message)) {
    answer =
      "Yes. E-commerce is one of the approved Zyngram service categories.";
  } else if (/\bjobs?\b/i.test(message)) {
    answer =
      "Yes. Jobs are included in the approved Zyngram service categories.";
  } else if (/\bfreelanc/i.test(message)) {
    answer =
      "Yes. Freelancing is included in the approved Zyngram service categories.";
  }
}

// --------------------------------------------------
// Services question
// --------------------------------------------------

else if (isServicesQuestion) {
  answer =
    "Approved Zyngram service categories include Mobile Recharge, utility services, e-commerce, logistics, food delivery, jobs, freelancing and other approved services.";
}
    // ----------------------------------------------
    // Save assistant message
    // ----------------------------------------------
    await runQuery(
      `
      INSERT INTO messages
      (
        conversation_id,
        role,
        content
      )
      VALUES (?, ?, ?)
      `,
      [
        conversationId,
        "assistant",
        answer
      ]
    );

    // ----------------------------------------------
    // Save message source
    // ----------------------------------------------
   try {
  await runQuery(
    `
    INSERT INTO MessageSources
    (
      message_id,
      title,
      category,
      version,
      source,
      relevance_score
    )
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      best.id,
      best.document_name || "Zyngram Overview",
      best.category || "Company",
      best.version || "2.0",
      best.source || "zyngram-overview.txt",
      best.relevanceScore || 1
    ]
  );
} catch (sourceError) {
  console.error(
    "Message source save error:",
    sourceError.message
  );
}
    // ----------------------------------------------
    // Save evaluation
    // ----------------------------------------------
    await saveEvaluation(
      conversationId,
      message,
      answer,
      true,
      best.relevanceScore || 1
    );

    // ----------------------------------------------
    // Response
    // ----------------------------------------------
    const responseTimeMs = Date.now() - startTime;

    return res.json({
      success: true,
      answer,
      grounded: true,
      sources: [
        {
          documentId: best.document_id,
          documentName:
            best.document_name || "Zyngram Overview",
          category: best.category || "Company",
          version: best.version || "2.0",
          source:
            best.source || "zyngram-overview.txt"
        }
      ],
      responseTimeMs
    });
  } catch (error) {
    console.error(
      "Zynora chat error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Zynora AI service error",
      error: error.message,
      responseTimeMs: Date.now() - startTime
    });
  }
});

module.exports = router;