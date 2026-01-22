---
description: Session Handoff Document for TalkLink Project
---

# TalkLink 세션 핸드오프 (Session Handoff)

**마지막 업데이트**: 2026-01-22

새로운 세션에서 작업을 이어갈 때 이 문서를 참조하세요.

---

## 📊 현재 프로젝트 상태

TalkLink는 **실시간 자동 번역 채팅 플랫폼**입니다. 현재 MVP 수준의 기능이 완성되어 작동합니다.

### ✅ 완료된 기능

| 기능 | 설명 | 관련 파일 |
|------|------|----------|
| **실시간 채팅** | Socket.io 기반 | `server/socket/chatHandler.js` |
| **자동 번역** | OpenRouter API (모델 선택 가능) | `server/services/translate.js` |
| **Discord 연동** | 양방향 메시지 동기화 | `server/services/discordBot.js` |
| **게스트 모드** | 초대 코드로 입장, 자동 채팅방 연결 | `client/src/App.jsx`, `Login.jsx` |
| **설정 창** | API 키 + 모델 설정 | `client/src/components/Settings/SettingsPanel.jsx` |
| **호스트/게스트 인증** | JWT 기반 | `server/socket/auth.js` |

### 🔲 TODO (미완료)

- [ ] AI 모델 파라미터 설정 (Temperature, Max Tokens 등)
- [ ] 사용자 정의 모델 추가 기능
- [ ] Discord 연동 상세 에러 처리 개선
- [ ] 프로덕션 배포 설정

---

## 🚀 개발 환경 시작하기

```bash
# 1. 백엔드 서버 시작 (Port 3000)
npm run server

# 2. 프론트엔드 개발 서버 시작 (Port 5173) - 새 터미널
cd client && npm run dev
```

**접속**: <http://localhost:5173>

---

## 📁 핵심 파일 구조

```
server/
├── index.js              # Express + Socket.io 메인 엔트리
├── db.js                 # SQLite DB 스키마 및 CRUD 메서드
├── services/
│   ├── translate.js      # 번역 로직 (OpenRouter API)
│   └── discordBot.js     # Discord 봇 서비스
├── socket/
│   ├── auth.js           # Socket 인증 미들웨어
│   └── chatHandler.js    # 채팅 메시지 처리
└── routes/
    ├── settings.js       # API 키/모델 설정
    └── integrations.js   # Discord 연동 설정

client/src/
├── App.jsx               # 앱 루트, Context Provider
├── components/
│   ├── Chat/             # ChatRoom, MessageBubble, IntegrationSettings
│   ├── Layout/           # Header, Sidebar, Login
│   └── Settings/         # SettingsPanel
└── hooks/useSocket.js    # Socket.io 커스텀 훅
```

---

## ⚠️ 삽질 기록 및 주의사항

### 1. Discord 연동 시 주의점

- **MESSAGE CONTENT INTENT 필수**: Discord Developer Portal에서 봇 설정에서 `MESSAGE CONTENT INTENT`를 반드시 활성화해야 메시지 내용을 읽을 수 있음
- **Channel ID ≠ Server ID**: 사용자가 Server ID를 입력하는 실수가 흔함. Channel ID는 채널 우클릭 → "Copy Channel ID"로 복사
- **Socket Room 네이밍**: `room:${roomId}` 형식 사용 (숫자 ID 포함)

### 2. 설정 창(SettingsPanel) 크래시

- **원인**: `lucide-react`의 `Key` 아이콘이 일부 환경에서 문제 발생
- **해결**: `Lock` 아이콘으로 대체
- **중국어 문자 혼입**: 텍스트에 `获取` (중국어)가 섞여있어 렌더링 문제 유발 → 한글로 수정

### 3. 게스트 모드 자동 입장

- 게스트 로그인 시 `localStorage.talklink_room_id`에 저장된 방 ID로 자동 입장해야 함
- `App.jsx`의 `useEffect`에서 `fetch(/api/rooms/${roomId})` 호출 필요

### 4. 메시지 정렬 (isOwn 판단)

- **호스트**: `sender_type === 'host'`면 오른쪽
- **게스트**: `sender_type === 'guest' && sender_id === participant.id`면 오른쪽
- **Discord/기타**: 항상 왼쪽

### 5. 번역 서비스 키 이슈

- DB의 `openrouter_model` 설정이 없으면 기본값 `openai/gpt-4o-mini` 사용
- 번역 결과가 JSON 파싱 실패 시 raw content를 그대로 반환

---

## 🔧 .agent 폴더 활용법

### Rules (자동 적용)

`.agent/rules/` 폴더의 파일들은 **항상 자동 적용**됩니다:

- `coding-style.md`: 코딩 컨벤션 (camelCase, async/await 등)
- `tech-stack.md`: 기술 스택 제약 (No TypeScript, SQLite만 사용 등)

**중요**: 새 규칙 추가 시 frontmatter에 `alwaysOn: true` 포함 필요.

### Skills (수동 호출)

`.agent/skills/` 폴더의 스킬은 **명시적 요청** 시 사용:

```
예시: "/test-e2e" 또는 "E2E 테스트 실행해줘"
```

현재 스킬:

- **test-e2e**: 브라우저 기반 자동화 테스트 (회원가입 → 채팅방 생성 → 메시지 전송)

---

## 💡 새 세션 시작 시 권장 프롬프트

```
TalkLink 프로젝트 이어서 작업하려고 해. 
.agent/SESSION_HANDOFF.md 파일을 먼저 읽고 현재 상태를 파악해줘.
```

또는 특정 작업:

```
TalkLink의 AI 모델 설정 고도화 작업을 시작하려고 해.
Temperature, Max Tokens 등 파라미터를 설정할 수 있게 해줘.
```

---

## 📞 테스트 계정

| 유형 | 이메일 | 비밀번호 |
|------|--------|----------|
| 호스트 | `demo@example.com` | `password123` |
| 게스트 | 초대 코드 입력 | 닉네임 자유 |

**초대 코드 확인**: 호스트 로그인 후 상단 헤더에 표시됨 (클릭하여 복사)
