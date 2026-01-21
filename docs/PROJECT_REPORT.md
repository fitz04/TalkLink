# 📘 TalkLink Project Report

**Version:** 1.0.0  
**Date:** January 22, 2026

---

## 1. Project Overview

**TalkLink** is a real-time, bi-directional translation chat platform designed for freelancers communicating with international clients. It acts as a bridge, allowing users to type in their native language (Korean) while the recipient sees the message in theirs (English), and vice-versa, preserving both context and nuance.

### Core Value Proposition

- **Seamless Communication:** Removes language barriers instantly via AI translation.
- **Context Preservation:** Displays both original and translated text to prevent misunderstandings.
- **AI-Powered Assistance:** Integrated RAG (Retrieval-Augmented Generation) assistant provides context-aware information from web search and chat history.
- **Business Tools:** Built-in email polishing, summarization, and proposal generation features.
- **Privacy & Sovereignty:** Fully self-hosted solution; user data remains local.

---

## 2. System Architecture

The project is built as a highly responsive single-page application (SPA) backed by a robust Node.js server.

```mermaid
graph TD
    User[User (Host/Guest)] -->|Socket.io / HTTP| LB[Load Balancer / Nginx (Optional)]
    LB -->|Socket.io| Socket[Socket Server (Node.js)]
    LB -->|REST API| API[Express API (Node.js)]
    
    subgraph "Server Layer"
        Socket
        API
        Auth[Auth Service]
        Translator[Translation Service]
        Assistant[AI Assistant Service]
    end
    
    subgraph "Data Layer"
        SQLite[(SQLite DB)]
        FTS[FTS5 Search Index]
    end
    
    subgraph "External Services"
        OpenRouter[OpenRouter API (LLM)]
        Tavily[Tavily API (Web Search)]
    end
    
    Socket --> AuthService
    API --> AuthService
    Translator --> OpenRouter
    Assistant --> Tavily
    Assistant --> FTS
    API --> SQLite
```

### Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | React 18 (Vite) | High performance, component reusability, fast build times. |
| **Styling** | Tailwind CSS | Rapid UI development, consistency, dark mode support. |
| **Backend** | Node.js + Express | Non-blocking I/O for real-time applications. |
| **Real-time** | Socket.io | Reliable bi-directional event-based communication. |
| **Database** | SQLite3 | Lightweight, zero-configuration, file-based persistence perfect for self-hosting. |
| **AI/ML** | OpenRouter (GPT/Claude) | Cost-effective access to SOTA models for translation and reasoning. |

---

## 3. Database Schema

The system uses `SQLite` with relational integrity and `FTS5` for full-text search capabilities.

```sql
-- Core Identity
CREATE TABLE host (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  password_hash TEXT,
  name TEXT,
  profile JSON, -- {skills, experience, strengths, portfolio}
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Chat Management
CREATE TABLE chat_rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER REFERENCES chat_rooms(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  language TEXT DEFAULT 'en',
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Messaging & Search
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL, -- 'host' or 'guest'
  sender_id INTEGER,
  original_text TEXT NOT NULL,
  translated_text TEXT,
  original_language TEXT,
  tone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE VIRTUAL TABLE messages_fts USING fts5(
  original_text, 
  translated_text, 
  content=messages, 
  content_rowid=id
);
```

---

## 4. API Specification

### Authentication

- `POST /api/auth/setup`: Initialize host account.
- `POST /api/auth/login`: Host login (Returns JWT).
- `GET /api/auth/me`: Validate session.

### Rooms & Chat

- `GET /api/rooms`: List all chat rooms.
- `POST /api/rooms`: Create a new room.
- `GET /api/rooms/invite/:code`: Resolve invite code.
- `POST /api/rooms/:id/join`: Guest join (Returns session token).
- `GET /api/rooms/:id/messages`: Fetch chat history.

### AI Services

- `POST /api/translate`: Standalone text translation.
- `POST /api/email/polish`: Refine business emails.
- `POST /api/email/summarize`: Summarize long emails into action items.
- `POST /api/proposal/generate`: Generate proposals based on chat history.
- `POST /api/assistant/analyze`: Analyze context for RAG suggestions.

---

## 5. User Flows

### Host (Freelancer) Flow

1. **Setup**: Initialize account & API keys (OpenRouter/Tavily).
2. **Room Creation**: Create a room for a specific client project.
3. **Invitation**: Send the generated invite link to the client.
4. **Communication**: Chat in Korean; system auto-translates to English.
5. **Assistance**: Use AI tools to generate proposals or polish emails based on the discussion.

### Guest (Client) Flow

1. **Access**: Click invite link (No registration required).
2. **Identification**: Enter nickname.
3. **Communication**: Chat in English; system auto-translates to Korean for the host.

---

## 6. Implementation Status & Roadmap

### ✅ Phase 1: MVP Core (Completed)

- [x] Full-stack architecture setup (Repo, Linting, Build).
- [x] Database schema design & implementation.
- [x] Host authentication & Guest session management.
- [x] Real-time messaging with Socket.io.
- [x] Basic bilingual translation pipeline.

### ✅ Phase 2: AI & Business Tools (Completed)

- [x] Email Polishing & Summarization.
- [x] Context-aware Proposal Generation.
- [x] AI Assistant Panel (UI & Basic Logic).

### 🚧 Phase 3: Enhancements (In Progress/Planned)

- [ ] **Chat Integrations**: Slack/Discord bi-directional sync (Next Priority).
- [ ] **Mobile Optimization**: PWA support or mobile-specific UI adjustments.
- [ ] **Voice Support**: Speech-to-Text (STT) and Text-to-Speech (TTS) integration.
- [ ] **File Sharing**: Secure upload and sharing of project files.

---

## 7. Configuration

Environmental variables required for operation:

```env
PORT=3000
JWT_SECRET=your_secure_random_string
# API Keys (Can also be set via UI)
OPENROUTER_API_KEY=sk-or-v1-...
TAVILY_API_KEY=tvly-...
```

For detailed setup instructions, please refer to `README.md`.
