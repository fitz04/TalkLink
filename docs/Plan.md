완벽해! 정리됐다.

---

## 확정된 변경사항

### 1. 아키텍처: 로컬 서버 방식
```
TalkLink/
├── server/           # Node.js 백엔드
│   ├── index.js      # Express + Socket.io
│   ├── db.js         # SQLite (better-sqlite3)
│   └── routes/       # API 라우트
├── client/           # React (Vite)
│   └── ...
├── docker-compose.yml
├── .env.example
└── README.md
```

### 2. AI 어시스턴트 트리거
```
┌─────────────────────────────────────────┐
│ 평상시                                   │
│ [🔍 관련 정보 검색]  ← 일반 버튼          │
├─────────────────────────────────────────┤
│ AI가 "찾아보는 게 좋겠다" 판단 시         │
│ [🔍❗관련 정보 검색]  ← 느낌표 뱃지       │
│                                         │
│ + 툴팁: "Pinecone RAG 관련 정보를        │
│         찾아볼까요?"                     │
└─────────────────────────────────────────┘
```

### 3. 웹 검색 API
- **1순위**: Tavily (직접 써봐서 익숙)
- **2순위**: Exa (백업 옵션)
- 설정에서 선택 가능하게

---

## 수정된 프롬프트 작성할게

주요 변경점:
1. Supabase → Node.js + SQLite + Socket.io
2. AI 어시스턴트 기능 추가
3. 웹 검색 API (Tavily/Exa) 추가
4. 오픈소스 배포 고려한 구조

---

# TalkLink - Claude Code 프로젝트 프롬프트 (v2)

---

## 1. 프로젝트 개요

### 프로젝트명
**TalkLink** - 실시간 자동 번역 채팅 플랫폼

### 목적
해외 클라이언트와 소통하는 프리랜서를 위한 **실시간 양방향 번역 채팅 플랫폼**. 사용자가 한국어로 입력하면 상대방에게는 영어로, 상대방이 영어로 입력하면 사용자에게는 한국어로 자동 번역되어 표시된다.

### 핵심 가치
- **언어 장벽 제거**: 실시간 자동 번역으로 자연스러운 대화
- **맥락 보존**: 원문 + 번역 동시 표시로 뉘앙스 파악 가능
- **AI 어시스턴트**: 대화 중 필요한 정보를 웹/이전 대화에서 찾아서 제공
- **비즈니스 효율화**: 대화 기록 기반 이메일 작성, 제안서 생성
- **완전 자체 호스팅**: 외부 서비스 의존 없이 로컬에서 실행

### 타겟 사용자
- **호스트**: 해외 클라이언트와 일하는 프리랜서 (한국어 사용, 서버 운영)
- **게스트**: 호스트의 클라이언트 (영어 사용, 초대 링크로 접속, 회원가입 불필요)

### 배포 방식
- 오픈소스 (GitHub 공개)
- `git clone` → `npm install` → `npm start`로 바로 실행 가능

---

## 2. 기술 스택

### 프론트엔드
- **프레임워크**: React 18 (Vite 기반)
- **스타일링**: Tailwind CSS (다크 모드 기본)
- **아이콘**: lucide-react
- **실시간 통신**: Socket.io-client

### 백엔드
- **런타임**: Node.js
- **프레임워크**: Express
- **실시간 통신**: Socket.io
- **데이터베이스**: SQLite (better-sqlite3)

### AI 연동
- **번역/생성 API**: OpenRouter (https://openrouter.ai/api/v1)
  - 실시간 채팅 번역: `openai/gpt-4o-mini` (속도 우선)
  - 이메일/Proposal/어시스턴트: `anthropic/claude-3.5-sonnet` (품질 우선)
- **웹 검색 API**: Tavily (기본) / Exa (대안, 설정에서 선택)
- **패키지**: openai (npm)

---

## 3. 프로젝트 구조

```
TalkLink/
├── server/
│   ├── index.js              # Express + Socket.io 메인
│   ├── db.js                 # SQLite 초기화 및 쿼리
│   ├── routes/
│   │   ├── auth.js           # 호스트 인증
│   │   ├── rooms.js          # 채팅방 CRUD
│   │   ├── messages.js       # 메시지 히스토리
│   │   └── templates.js      # 템플릿 CRUD
│   ├── services/
│   │   ├── translator.js     # OpenRouter 번역 호출
│   │   ├── assistant.js      # AI 어시스턴트 로직
│   │   └── webSearch.js      # Tavily/Exa 검색
│   └── socket/
│       └── chatHandler.js    # 실시간 채팅 이벤트
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── Header.jsx
│   │   │   ├── Chat/
│   │   │   │   ├── ChatRoom.jsx
│   │   │   │   ├── MessageBubble.jsx
│   │   │   │   ├── MessageInput.jsx
│   │   │   │   └── AssistantPanel.jsx   # AI 어시스턴트 사이드 패널
│   │   │   ├── Email/
│   │   │   │   └── EmailMode.jsx
│   │   │   ├── Proposal/
│   │   │   │   └── ProposalMode.jsx
│   │   │   └── Settings/
│   │   │       ├── Profile.jsx
│   │   │       ├── ApiKeys.jsx
│   │   │       └── Templates.jsx
│   │   ├── hooks/
│   │   │   ├── useSocket.js
│   │   │   └── useTranslation.js
│   │   ├── lib/
│   │   │   └── api.js
│   │   └── styles/
│   │       └── globals.css
│   ├── index.html
│   └── vite.config.js
├── data/                      # SQLite DB 파일 저장
│   └── talklink.db
├── docker-compose.yml
├── .env.example
├── package.json
└── README.md
```

---

## 4. 사용자 흐름

### 호스트 (프리랜서) 플로우
```
1. 최초 실행 시 관리자 계정 생성 (로컬이므로 간단히)
2. API Key 설정 (OpenRouter, Tavily/Exa)
3. 프로필 설정 (기술스택, 경력, 강점)
4. 채팅방 생성 (프로젝트명/클라이언트명)
5. 초대 링크 생성 → 클라이언트에게 전달
6. 채팅 시작
   - 한국어 입력 → 영어로 번역되어 상대방에게 전송
   - 상대방 영어 → 한국어 번역과 함께 표시
   - AI 어시스턴트가 필요시 정보 제안
7. 대화 기록 → 이메일/Proposal 작성에 활용
```

### 게스트 (클라이언트) 플로우
```
1. 호스트에게 받은 초대 링크 클릭
2. 닉네임 입력 (회원가입 불필요)
3. 채팅방 입장
4. 채팅 (영어로 입력, 번역은 호스트 측에서 처리)
```

---

## 5. 기능 상세 명세

### 5.1 실시간 채팅 (Chat)

**UI 구성**
```
┌────────────────────────────────────────────────────────────┐
│ Header: TalkLink 로고 + 채팅방 이름 + 설정                   │
├────────────┬───────────────────────────┬───────────────────┤
│            │                           │                   │
│  Sidebar   │      Chat Area            │  Assistant Panel  │
│            │                           │  (접이식)          │
│ - 채팅방    │  [메시지들...]             │                   │
│   목록     │                           │  💡 관련 정보      │
│            │                           │  - 웹 검색 결과    │
│ - Email    │                           │  - 이전 대화       │
│ - Proposal │  ┌─────────────────────┐  │                   │
│            │  │ 입력창        [전송] │  │                   │
│ - 설정     │  └─────────────────────┘  │                   │
│            │  [톤 선택 ▼] [🔍 검색]    │                   │
└────────────┴───────────────────────────┴───────────────────┘
```

**메시지 표시 형식**
```
[게스트 메시지 - 왼쪽]
┌─────────────────────────────┐
│ 👤 John                     │
│ No problem, when can you    │  ← 원문
│ deliver?                    │
│ ─────────────────────────── │
│ 문제없어요, 언제 전달        │  ← 번역 (호스트에게만 표시)
│ 가능한가요?                  │
│                   10:30 AM  │
└─────────────────────────────┘

[호스트 메시지 - 오른쪽]
┌─────────────────────────────┐
│ 금요일까지 보내드릴게요      │  ← 원문 (호스트에게 표시)
│ ─────────────────────────── │
│ I'll send it to you by      │  ← 번역 (실제 전송되는 내용)
│ Friday.                     │
│                     [복사📋]│
│ 10:31 AM                    │
└─────────────────────────────┘
```

**톤 선택 옵션**
- Proposal: 적극적, 전문적 (제안 시)
- Negotiation: 단호하지만 예의있게 (협상 시)
- Update: 간결, 명확 (진행상황 보고)
- Issue: 솔직하지만 해결책 제시 (문제 상황)
- Friendly: 캐주얼, 관계 유지용

**핵심 기능**
- 자동 언어 감지 (한국어 ↔ 영어)
- 수동 언어 선택 옵션
- 번역 결과 클립보드 복사
- 그룹 채팅 지원 (1:N)
- 메시지 실시간 동기화 (Socket.io)

### 5.2 AI 어시스턴트 (Assistant)

**UI: 채팅 영역 우측 접이식 패널**

**동작 방식**
```
1. AI가 번역하면서 동시에 "정보 필요 여부" 판단
2. 필요하다고 판단되면:
   - 검색 버튼에 ❗ 뱃지 표시
   - 툴팁: "RAG + Pinecone 관련 정보를 찾아볼까요?"
3. 호스트가 버튼 클릭 (또는 자동 펼침 설정 시 자동)
4. Assistant Panel에 결과 표시
```

**패널 내용**
```
┌─────────────────────────────┐
│ 💡 AI 어시스턴트     [닫기 ✕]│
├─────────────────────────────┤
│ 🔍 웹 검색 결과              │
│ ────────────────            │
│ Pinecone은 벡터 DB로...     │
│ 주요 사용법: ...            │
│ [출처: pinecone.io]         │
│                             │
│ 💬 관련 이전 대화            │
│ ────────────────            │
│ 2024.01.15 - ProjectA       │
│ "RAG 구현 견적 $3000 협의"   │
│ [대화로 이동]                │
│                             │
│ 📝 제안 답변                 │
│ ────────────────            │
│ "Yes, I have experience     │
│ with Pinecone RAG..."       │
│                     [사용📋]│
└─────────────────────────────┘
```

**트리거 조건 (AI 판단 기준)**
```
시스템 프롬프트에 포함:
- 기술 용어가 나왔는데 호스트가 모를 수 있는 경우
- 가격/일정 등 이전에 논의했을 법한 내용
- 클라이언트가 구체적인 기술 스펙을 요구하는 경우
- 호스트가 답변하기 어려워 보이는 질문
```

**검색 소스**
1. **웹 검색**: Tavily API (기본) / Exa API (설정에서 선택)
2. **이전 대화**: SQLite 전문 검색 (FTS5)

### 5.3 이메일 모드 (Email)

**UI: 좌우 2단 분할**
```
┌─────────────────────┬─────────────────────┐
│ 📝 입력              │ ✨ 결과              │
│                     │                     │
│ [텍스트 입력 영역]   │ [처리된 결과]        │
│                     │                     │
│                     │             [복사📋]│
├─────────────────────┴─────────────────────┤
│ [✨ 영어로 다듬기] [🧐 한국어 요약] [톤 ▼] │
└───────────────────────────────────────────┘
```

**기능**
1. **영어로 다듬기**: 한국어/엉성한 영어 → 비즈니스 영어 이메일
2. **한국어 요약**: 영어 이메일 → 3줄 요약 + Action Item

### 5.4 제안서 생성 (Proposal)

**UI**
```
┌───────────────────────────────────────────┐
│ 📂 참조할 대화 선택                        │
│ ┌─────────────────────────────────────┐   │
│ │ ☑ ProjectA - John (2024.01.15)     │   │
│ │ ☐ ProjectB - Sarah (2024.01.10)    │   │
│ └─────────────────────────────────────┘   │
├───────────────────────────────────────────┤
│ 📝 추가 지시사항 (선택)                    │
│ ┌─────────────────────────────────────┐   │
│ │ 예산 범위 $2000-3000 강조해줘        │   │
│ └─────────────────────────────────────┘   │
├───────────────────────────────────────────┤
│              [🚀 Proposal 생성]            │
├───────────────────────────────────────────┤
│ 📄 생성된 Proposal                        │
│ ┌─────────────────────────────────────┐   │
│ │ Hi John,                            │   │
│ │                                     │   │
│ │ I noticed you're looking for...     │   │
│ │ ...                                 │   │
│ └─────────────────────────────────────┘   │
│                                   [복사📋]│
└───────────────────────────────────────────┘
```

**입력 데이터**
- 선택한 대화 기록
- 호스트 프로필 (기술스택, 경력, 강점)
- 추가 지시사항

### 5.5 설정

**프로필 설정**
- 이름/닉네임
- 주요 기술 스택
- 경력 요약
- 강점 포인트
- 포트폴리오 링크

**API Key 설정**
- OpenRouter API Key
- Tavily API Key (웹 검색용)
- Exa API Key (대안)
- 검색 API 선택 (Tavily/Exa)

**템플릿 관리**
- 자주 쓰는 문구 저장/편집/삭제
- 카테고리: 인사/협상/업데이트/마무리

---

## 6. 데이터베이스 스키마 (SQLite)

```sql
-- 호스트 (서버 운영자, 1명)
CREATE TABLE host (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  password_hash TEXT,
  name TEXT,
  profile JSON, -- {skills, experience, strengths, portfolio}
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- API 설정
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
-- keys: openrouter_api_key, tavily_api_key, exa_api_key, search_provider

-- 채팅방
CREATE TABLE chat_rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 채팅 참여자 (게스트)
CREATE TABLE participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER REFERENCES chat_rooms(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL, -- 세션 식별용
  language TEXT DEFAULT 'en',
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 메시지
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL, -- 'host' or 'guest'
  sender_id INTEGER, -- participants.id (게스트) or NULL (호스트)
  original_text TEXT NOT NULL,
  translated_text TEXT,
  original_language TEXT,
  tone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 전문 검색용 가상 테이블
CREATE VIRTUAL TABLE messages_fts USING fts5(
  original_text, 
  translated_text, 
  content=messages, 
  content_rowid=id
);

-- 템플릿
CREATE TABLE templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT, -- greeting/negotiation/update/closing
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 이메일 히스토리
CREATE TABLE email_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  input_text TEXT NOT NULL,
  output_text TEXT NOT NULL,
  mode TEXT NOT NULL, -- 'polish' or 'summarize'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- AI 어시스턴트 검색 히스토리
CREATE TABLE assistant_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER REFERENCES chat_rooms(id),
  query TEXT NOT NULL,
  web_results JSON,
  chat_results JSON,
  suggested_reply TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 7. API 엔드포인트

### 인증
```
POST /api/auth/setup     # 최초 호스트 계정 생성
POST /api/auth/login     # 호스트 로그인
GET  /api/auth/me        # 현재 사용자 정보
```

### 채팅방
```
GET    /api/rooms              # 채팅방 목록
POST   /api/rooms              # 채팅방 생성
GET    /api/rooms/:id          # 채팅방 상세
DELETE /api/rooms/:id          # 채팅방 삭제
GET    /api/rooms/invite/:code # 초대 링크로 채팅방 조회
POST   /api/rooms/:id/join     # 게스트 참여
```

### 메시지
```
GET  /api/rooms/:id/messages   # 메시지 히스토리
POST /api/rooms/:id/messages   # 메시지 저장 (HTTP fallback)
```

### 번역/AI
```
POST /api/translate            # 텍스트 번역
POST /api/assistant/analyze    # AI 어시스턴트 (정보 필요 여부 판단)
POST /api/assistant/search     # 웹 + 이전대화 검색
POST /api/email/polish         # 이메일 다듬기
POST /api/email/summarize      # 이메일 요약
POST /api/proposal/generate    # Proposal 생성
```

### 설정
```
GET  /api/settings             # 설정 조회
PUT  /api/settings             # 설정 저장
GET  /api/profile              # 프로필 조회
PUT  /api/profile              # 프로필 저장
```

### 템플릿
```
GET    /api/templates          # 템플릿 목록
POST   /api/templates          # 템플릿 생성
PUT    /api/templates/:id      # 템플릿 수정
DELETE /api/templates/:id      # 템플릿 삭제
```

---

## 8. Socket.io 이벤트

### 클라이언트 → 서버
```javascript
socket.emit('join_room', { roomId, token })      // 채팅방 입장
socket.emit('leave_room', { roomId })            // 채팅방 퇴장
socket.emit('send_message', {                    // 메시지 전송
  roomId,
  text,
  tone,           // 호스트만
  senderType      // 'host' or 'guest'
})
socket.emit('typing', { roomId, isTyping })      // 타이핑 표시
```

### 서버 → 클라이언트
```javascript
socket.on('new_message', {                       // 새 메시지 수신
  id,
  senderType,
  senderName,
  originalText,
  translatedText,  // 호스트에게만 (게스트 메시지일 때)
  timestamp
})
socket.on('user_joined', { nickname })           // 참여자 입장 알림
socket.on('user_left', { nickname })             // 참여자 퇴장 알림
socket.on('typing', { nickname, isTyping })      // 타이핑 표시
socket.on('assistant_suggestion', {              // AI 어시스턴트 제안
  shouldSearch: true,
  reason: "Pinecone RAG 관련 정보가 도움될 것 같습니다",
  suggestedQuery: "Pinecone RAG implementation"
})
```

---

## 9. AI 프롬프트

### 번역 + 어시스턴트 판단 (통합)
```
You are a professional IT translator with 15 years of experience, also acting as a smart assistant.

## Task 1: Translation
Translate the input text:
- Korean → English / English → Korean (auto-detect)
- Maintain professional business tone
- Keep technical terms unchanged: API, RAG, DSP, Latency, etc.
- Apply tone: {selected_tone}

## Task 2: Assistant Analysis
Analyze if the host might need additional information:
- Technical terms the host might not know
- Topics discussed in previous conversations
- Specific technical requirements from client
- Questions that seem difficult to answer

## Output Format (JSON)
{
  "translation": "translated text here",
  "detected_language": "ko" or "en",
  "assistant": {
    "should_search": true/false,
    "reason": "why search might help (in Korean)",
    "suggested_query": "search query if should_search is true"
  }
}
```

### 웹 검색 요약
```
You are a research assistant. Summarize the following search results concisely in Korean.
Focus on practical, actionable information that would help a freelance developer.

Search Query: {query}
Search Results: {results}

Format:
- 핵심 내용 (3-5줄)
- 관련 링크
```

### 이전 대화 검색 요약
```
You are analyzing previous chat history to find relevant context.
Summarize any related discussions in Korean.

Current Topic: {topic}
Search Results: {chat_results}

Format:
- 관련 대화 요약
- 날짜 및 채팅방
- 핵심 합의사항 또는 논의 내용
```

### 이메일 다듬기
```
You are a professional business communication expert.
Transform the input into a polished business email in English.

Rules:
- Professional and courteous tone
- Clear structure: Greeting - Body - Closing
- Keep technical terms unchanged
- Tone: {selected_tone}

Input: {input_text}
```

### 이메일 요약
```
You are a professional assistant helping a Korean freelancer.
Analyze the English email and provide:

## 핵심 요약 (3줄)
- Point 1
- Point 2
- Point 3

## Action Items
- [ ] Task 1
- [ ] Task 2

## 숨은 의도/뉘앙스 (있다면)
- 분석 내용

Input Email: {email_text}
```

### Proposal 생성
```
You are an expert Upwork proposal writer.
Create a compelling proposal based on the conversation history and freelancer profile.

## Freelancer Profile
{profile}

## Conversation History
{conversations}

## Additional Instructions
{instructions}

## Proposal Structure
1. Hook: Address client's specific need mentioned in conversation
2. Experience: Relevant skills and past work
3. Approach: How you'll tackle this project
4. Timeline & Budget: If discussed
5. Call to Action: Clear next step

Write in professional English, keep it concise but compelling.
```

---

## 10. UI/UX 요구사항

### 테마
- **기본**: 다크 모드 (Slate 800/900 배경)
- 눈이 편안한 색상 (저채도)
- 선택적 라이트 모드 토글

### 색상 팔레트 (다크 모드)
```
배경: slate-900 (#0f172a)
카드/패널: slate-800 (#1e293b)
테두리: slate-700 (#334155)
주요 텍스트: slate-100 (#f1f5f9)
보조 텍스트: slate-400 (#94a3b8)
강조색: blue-500 (#3b82f6)
성공: green-500 (#22c55e)
경고: amber-500 (#f59e0b)
```

### 스타일
- 모던하고 세련된 느낌
- Glassmorphism: 반투명 배경 + blur
- 부드러운 애니메이션/트랜지션
- 그림자 최소화 (다크 모드 특성)

### 반응형
- 데스크탑 우선 (최소 1024px)
- 태블릿 대응 (768px~)
- 모바일은 추후 고려

---

## 11. 환경 변수

```env
# .env.example

# Server
PORT=3000
HOST=localhost

# Database
DB_PATH=./data/talklink.db

# JWT (호스트 인증용)
JWT_SECRET=your-secret-key-change-this

# OpenRouter (사용자가 UI에서 설정)
# OPENROUTER_API_KEY=

# Tavily (사용자가 UI에서 설정)
# TAVILY_API_KEY=

# Exa (사용자가 UI에서 설정)
# EXA_API_KEY=
```

---

## 12. 구현 우선순위

### Phase 1: 핵심 MVP
1. 프로젝트 세팅 (Vite + Express + SQLite)
2. 기본 UI 레이아웃 (다크 모드)
3. 호스트 인증 (간단한 로그인)
4. API Key 설정 화면
5. 채팅방 생성 + 초대 링크
6. 게스트 접속 (닉네임만)
7. 실시간 채팅 (Socket.io)
8. 자동 번역 (원문 + 번역 표시)
9. 메시지 복사 기능

### Phase 2: AI 어시스턴트
10. AI 어시스턴트 판단 로직
11. 웹 검색 연동 (Tavily)
12. 이전 대화 검색 (FTS5)
13. Assistant Panel UI
14. 검색 버튼 + 느낌표 뱃지

### Phase 3: 확장 기능
15. 톤 선택 기능
16. 이메일 모드
17. 프로필 설정
18. 템플릿 관리

### Phase 4: 고급 기능
19. Proposal 생성
20. Exa 검색 옵션 추가
21. 히스토리 검색/관리
22. UI 폴리싱

### Phase 5: 배포 준비
23. Docker 설정
24. README 작성
25. GitHub 공개

---

## 13. 실행 방법 (README용)

```bash
# 1. 저장소 클론
git clone https://github.com/username/TalkLink.git
cd TalkLink

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env
# .env 파일에서 JWT_SECRET 변경

# 4. 실행
npm run dev

# 5. 브라우저에서 접속
# http://localhost:3000

# 6. 최초 실행 시 호스트 계정 생성 후
#    Settings에서 API Key 설정
```

---

## 14. 참고사항

- OpenRouter API는 `openai` npm 패키지 사용, `baseURL`만 변경
- 게스트는 번역 기능 사용 안 함 (비용은 호스트 부담)
- 모든 API Key는 서버 메모리/DB에 저장, 클라이언트 노출 금지
- Socket.io 연결은 토큰 기반 인증 (호스트: JWT, 게스트: 세션 토큰)
- SQLite FTS5로 한글 검색 지원 (추가 토크나이저 필요시 확장)

---

검토해보고 수정/추가할 부분 있으면 말해줘!