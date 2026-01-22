---
description: How to effectively use .agent folder for AI-assisted development
---

# .agent 폴더 활용 가이드

TalkLink 프로젝트에서 AI 에이전트를 효과적으로 활용하는 방법입니다.

---

## 📁 폴더 구조

```
.agent/
├── rules/                    # 자동 적용 규칙
│   ├── coding-style.md       # 코딩 컨벤션
│   └── tech-stack.md         # 기술 스택 제약
├── skills/                   # 수동 호출 스킬
│   └── test-e2e/
│       └── SKILL.md          # E2E 테스트 자동화
├── workflows/                # 워크플로우 정의 (선택)
├── SESSION_HANDOFF.md        # 세션 핸드오프 문서
└── AGENT_GUIDE.md            # 이 파일
```

---

## 📜 Rules (규칙)

### 목적

AI 에이전트가 코드 작성 시 **항상** 참조해야 할 규칙을 정의합니다.

### 파일 형식

```markdown
---
description: 규칙 설명
globs: "**/*.js"           # 적용할 파일 패턴
alwaysOn: true             # 항상 활성화
---

# 규칙 제목

규칙 내용...
```

### 현재 규칙

| 파일 | 목적 |
|------|------|
| `coding-style.md` | 네이밍 컨벤션, async/await 사용, 코멘트 언어 등 |
| `tech-stack.md` | React+Vite, Express, SQLite만 사용, TypeScript 금지 |

### 새 규칙 추가 예시

```markdown
---
description: API Route 작성 가이드라인
globs: "server/routes/*.js"
alwaysOn: true
---

# API Route Guidelines

- 모든 라우트는 try/catch로 감쌈
- 에러 응답은 `{ error: '메시지' }` 형식
- 성공 응답은 `{ data: ... }` 또는 `{ success: true }`
```

---

## 🛠 Skills (스킬)

### 목적

복잡한 반복 작업을 자동화하는 **재사용 가능한 워크플로우**입니다.

### 파일 구조

```
.agent/skills/[스킬명]/
└── SKILL.md              # 필수: 스킬 정의 파일
└── scripts/              # 선택: 헬퍼 스크립트
└── examples/             # 선택: 예제 파일
```

### SKILL.md 형식

```markdown
---
name: skill-name
description: 스킬 설명
---

# 스킬 제목

## Usage
어떤 상황에서 이 스킬을 사용하는지

## Workflow Steps
1. 첫 번째 단계
2. 두 번째 단계
...

## Report
결과 보고 방식
```

### 스킬 호출 방법

1. **슬래시 명령어**: `/test-e2e`
2. **자연어 요청**: "E2E 테스트 실행해줘", "앱 테스트 해봐"
3. **명시적 요청**: ".agent/skills/test-e2e/SKILL.md 읽고 실행해"

### 현재 스킬

| 스킬 | 설명 | 호출 예시 |
|------|------|----------|
| `test-e2e` | 브라우저 자동화 E2E 테스트 | `/test-e2e` 또는 "앱 테스트해줘" |

### 새 스킬 추가 예시

Discord 연동 테스트 스킬:

```markdown
---
name: test-discord
description: Discord 봇 연동 테스트 자동화
---

# Discord Integration Test

## Usage
"디스코드 연동 테스트" 요청 시 실행

## Prerequisites
- Discord 봇 토큰 설정 완료
- 테스트용 Discord 채널 준비

## Workflow Steps
1. TalkLink에서 테스트 채팅방 생성
2. Integration Settings에서 Discord 연동 설정
3. TalkLink에서 메시지 전송
4. Discord에서 메시지 수신 확인
5. Discord에서 메시지 전송
6. TalkLink에서 번역된 메시지 수신 확인

## Report
연동 성공/실패 여부 및 스크린샷
```

---

## 🔄 Workflows (워크플로우)

### 목적

자주 사용하는 **개발 명령어 시퀀스**를 정의합니다.

### 파일 위치

`.agent/workflows/[워크플로우명].md`

### 형식

```markdown
---
description: 워크플로우 설명
---

# 워크플로우 제목

1. 첫 번째 단계
// turbo   <- 이 주석이 있으면 자동 실행
2. 두 번째 단계
```

### 예시: 빌드 및 배포

```markdown
---
description: 프로덕션 빌드 및 배포
---

# Build and Deploy

1. 프론트엔드 빌드
// turbo
```bash
cd client && npm run build
```

1. 서버 재시작

```bash
npm run server
```

```

---

## 💡 효과적인 활용 팁

### 1. 세션 시작 시
```

.agent/SESSION_HANDOFF.md 읽고 프로젝트 현황 파악해줘

```

### 2. 새 기능 개발 전
```

.agent/rules/ 폴더의 규칙들 확인하고 [기능명] 구현해줘

```

### 3. 규칙 위반 방지
규칙 파일에 `alwaysOn: true`를 설정하면 AI가 해당 파일 패턴 작업 시 자동으로 참조합니다.

### 4. 반복 작업 자동화
자주 하는 작업이 있다면 스킬로 만들어두면 편리합니다:
- 테스트 실행
- 특정 패턴의 코드 생성
- 배포 프로세스

---

## 🔗 관련 문서

- [SESSION_HANDOFF.md](./SESSION_HANDOFF.md) - 세션 핸드오프 문서
- [rules/coding-style.md](./rules/coding-style.md) - 코딩 스타일 가이드
- [rules/tech-stack.md](./rules/tech-stack.md) - 기술 스택 제약
- [skills/test-e2e/SKILL.md](./skills/test-e2e/SKILL.md) - E2E 테스트 스킬
