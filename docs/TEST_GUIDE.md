# 🧪 TalkLink Test Guide

**Version:** 1.0.0  
**Date:** January 22, 2026

---

## 1. Testing Strategy

We adopt a **Test-Driven Development (TDD)** approach with a "Testing Pyramid" strategy to ensure reliability and speed.

| Level | Type | Coverage Target | Tools |
|-------|------|-----------------|-------|
| **L1** | **Unit Tests** | 70% | Jest, Vitest, Testing Library |
| **L2** | **Integration Tests** | 20% | Supertest |
| **L3** | **E2E / Manual** | 10% | Playwright, Manual Checklist |

### Core Principles

- **Fast Feedback**: Unit tests should run in under 10 seconds.
- **Isolation**: Level 1 tests must not depend on external APIs (mocking required).
- **Critical Paths**: E2E tests focus strictly on critical user flows (Signup -> Chat).

---

## 2. Test Environment

### Prerequisites

- **Node.js**: v18+
- **Database**: SQLite (Test instance created in-memory or `database.test.sqlite`)

### Configuration

Create a `.env.test` file for isolated testing configuration:

```env
PORT=3001
DB_PATH=:memory:
JWT_SECRET=test-secret
```

---

## 3. Automated Tests

### 3.1 Unit & Integration Tests

**Command:** `npm test`

#### Key Test Scenarios

1. **Authentication**:
    - Valid/Invalid JWT token verification.
    - Host login success/failure.
2. **Database Operations**:
    - CRUD operations for Rooms, Participants, and Messages.
    - Constraint violations (e.g., duplicate emails).
3. **Translation Service**:
    - Mocked API responses to verify parsing logic.
    - Cache hit/miss behavior.

### 3.2 E2E Tests (Playwright)

**Command:** `npm run test:e2e`

#### Critical User Flows

1. **Host onboarding**: Register -> Setup API Key -> Create Room.
2. **Guest Join**: Invite Link -> Enter Nickname -> Join.
3. **Chat Flow**: Send Message -> Verify Translation Display -> Socket Sync.

---

## 4. Manual Verification Checklist

Use this checklist for regression testing before major releases.

### 4.1 Chat & Real-time

- [ ] **Room Creation**: Can generate room and get unique invite code.
- [ ] **Guest Join**: Guest can join via incognito window using the invite link.
- [ ] **Messaging**:
  - [ ] Host sends Korean -> Guest sees English.
  - [ ] Guest sends English -> Host sees Korean.
  - [ ] Messages appear instantly (Socket.io).
- [ ] **Reconnection**: Chat recovers after temporary network disconnect.

### 4.2 AI Features (Requires API Key)

- [ ] **Translation Accuracy**: Text is translated with correct context/tone (if configured).
- [ ] **Assistant Panel**: Suggestions appear for technical keywords in chat.
- [ ] **Email Polishing**:
  - [ ] Input rough text -> Output polished professional email.
  - [ ] Copy button works.
- [ ] **Proposal Generation**: Generates relevant proposal from mock chat history.

### 4.3 Resilience

- [ ] **Invalid API Key**: Chat continues to function (fallback to plain text) even if translation API fails.
- [ ] **Server Restart**: Client attempts auto-reconnection and state is consistent.

---

## 5. Defect Reporting

When reporting bugs, please use the following format:

**[Type] Short Description**

- **Severity**: P0 (Critical) / P1 (Major) / P2 (Minor)
- **Steps to Reproduce**:
  1. Go to ...
  2. Click ...
- **Expected**: ...
- **Actual**: ...
- **Screenshots/Logs**: (Attach if available)
