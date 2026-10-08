# Zynora 2.1 – Production Version Plan

## 1. Current Version

Zynora 2.0

## 2. Next Version

Zynora 2.1

## 3. Planned Features

- Persistent conversation management
- New conversation support
- Conversation history
- Continue previous conversation
- Rename conversation
- Delete conversation
- Clear conversation
- Context-aware RAG
- Relevant answer selection from approved knowledge
- AI response evaluation
- Monitoring dashboard
- Production logging
- Security and abuse testing
- Knowledge administration
- Production health verification

## 4. Existing Issues Identified

- Knowledge retrieval originally returned the complete knowledge chunk instead of only the most relevant information.
- Monitoring needs additional Day 12 metrics such as daily questions, retrieval failures, FAQs, error count and AI service health.
- Security controls are currently demonstration-level and require further production hardening.
- Public production deployment and actual rollback have not yet been performed.

## 5. Database Changes

The Day 12 release uses database tables for:

- Conversations
- Messages
- MessageSources
- AIResponseEvaluations
- ProductionLogs
- KnowledgeDocuments
- KnowledgeChunks

The knowledge document version was updated to Version 2.0.

## 6. API Changes

The release uses APIs for:

- Zynora chat
- Conversation creation
- Conversation management
- Monitoring
- Production logs
- Knowledge administration
- Knowledge status management

## 7. Deployment Changes

The next release will require:

- Backend environment configuration
- Frontend environment configuration
- Database migration or initialization
- Backend deployment
- Frontend deployment
- API verification
- Health check
- Smoke testing
- Version verification
- Production log verification

## 8. Rollback Plan

If the Zynora 2.1 release causes a critical problem:

1. Stop the new release.
2. Restore the previous stable application version.
3. Restore the previous database state if required.
4. Restart the backend.
5. Restart the frontend.
6. Verify the Zynora API.
7. Verify the main user flow.
8. Check application logs.
9. Confirm that the stable version is working.

## 9. Release Verification

Before considering Zynora 2.1 ready:

- Zynora chat must work.
- Approved knowledge retrieval must work.
- No-answer behavior must work.
- Conversation management must work.
- Context-aware follow-up must work.
- AI evaluation records must be created.
- Monitoring must work.
- Production logs must be available.
- Security tests must pass.
- Frontend and backend must communicate correctly.
- Version information must be verified.