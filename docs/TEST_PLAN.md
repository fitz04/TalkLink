# TalkLink 테스트 계획서

## 1. 개요

### 1.1 목적
본 문서는 TalkLink 프로젝트의 테스트 전략, 테스트 케이스, 그리고 예상 결과를 상세히 기술합니다.

### 1.2 테스트 범위
- 단위 테스트 (Unit Tests)
- 통합 테스트 (Integration Tests)
- E2E 테스트 (End-to-End Tests)
- 수동 테스트 (Manual Tests)

---

## 2. 테스트 환경

### 2.1 하드웨어 요구사항
| 구성요소 | 최소 사양 | 권장 사양 |
|----------|-----------|-----------|
| CPU | 2 core | 4 core+ |
| Memory | 4GB | 8GB+ |
| Storage | 10GB | 50GB+ SSD |

### 2.2 소프트웨어 환경
- Node.js v18+
- npm v9+
- SQLite 3.x
- Chrome/Firefox (최신 버전)

### 2.3 테스트 데이터
```javascript
// 테스트용 호스트 계정
const testHost = {
  email: 'test@talklink.local',
  password: 'testpassword123',
  name: 'Test Host'
};

// 테스트용 API 키 (실제 API 키로 대체 필요)
const testApiKeys = {
  openrouter: process.env.OPENROUTER_API_KEY || 'sk-test-key',
  tavily: process.env.TAVILY_API_KEY || 'tvly-test-key'
};
```

---

## 3. 단위 테스트 (Unit Tests)

### 3.1 서버 사이드 단위 테스트

#### 3.1.1 데이터베이스 모듈 (db.js)

| 테스트 ID | 테스트 시나리오 | 예상 결과 | 우선순위 |
|-----------|----------------|----------|---------|
| DB-001 | 호스트 생성 | 생성된 호스트 정보 반환 | P0 |
| DB-002 | 호스트 이메일로 조회 | 해당 호스트 정보 반환 | P0 |
| DB-003 | 중복 이메일 호스트 생성 | 에러 발생 | P1 |
| DB-004 | 채팅방 생성 | 초대 코드와 함께 생성 | P0 |
| DB-005 | 초대 코드로 채팅방 조회 | 해당 채팅방 정보 반환 | P0 |
| DB-006 | 잘못된 초대 코드 조회 | null 반환 | P1 |
| DB-007 | 메시지 저장 및 조회 | 메시지 목록 반환 | P0 |
| DB-008 | FTS5 검색 | 검색 결과 반환 | P1 |
| DB-009 | 참여자 생성 | 토큰과 함께 참여자 정보 반환 | P0 |
| DB-010 | 만료된 토큰으로 참여자 조회 | null 반환 | P2 |

```javascript
// DB-001: 호스트 생성 테스트 예시
describe('DB Host Operations', () => {
  test('should create host successfully', async () => {
    const db = require('./server/db');
    const host = await new Promise((resolve, reject) => {
      db.createHost(
        'test@example.com',
        '$2a$10$...', // bcrypt hash
        'Test User',
        JSON.stringify({ skills: ['React', 'Node.js'] }),
        (err, row) => err ? reject(err) : resolve(row)
      );
    });
    expect(host).toHaveProperty('id');
    expect(host.email).toBe('test@example.com');
  });
});
```

#### 3.1.2 인증 모듈 (auth.js)

| 테스트 ID | 테스트 시나리오 | 예상 결과 | 우선순위 |
|-----------|----------------|----------|---------|
| AUTH-001 | 유효한 JWT 토큰 검증 | decoded 사용자 정보 반환 | P0 |
| AUTH-002 | 만료된 JWT 토큰 검증 | 에러 발생 | P1 |
| AUTH-003 | 유효하지 않은 토큰 검증 | 에러 발생 | P1 |
| AUTH-004 | 호스트 로그인 성공 | JWT 토큰 반환 | P0 |
| AUTH-005 | 잘못된 비밀번호로 로그인 | 에러 발생 | P0 |
| AUTH-006 | 존재하지 않는 이메일로 로그인 | 에러 발생 | P1 |
| AUTH-007 | Socket.io 토큰 인증 성공 | 소켓 연결 허용 | P0 |
| AUTH-008 | Socket.io 토큰 인증 실패 | 소켓 연결 거부 | P1 |

#### 3.1.3 번역 모듈 (translate.js)

| 테스트 ID | 테스트 시나리오 | 예상 결과 | 우선순위 |
|-----------|----------------|----------|---------|
| TRANS-001 | 한국어 → 영어 번역 | 영어 텍스트 반환 | P0 |
| TRANS-002 | 영어 → 한국어 번역 | 한국어 텍스트 반환 | P0 |
| TRANS-003 | 빈 텍스트 번역 | 빈 문자열 반환 | P1 |
| TRANS-004 | 캐시된 번역 조회 | 캐시된 결과 반환 | P2 |
| TRANS-005 | 언어 감지 (한국어) | 'ko' 반환 | P1 |
| TRANS-006 | 언어 감지 (영어) | 'en' 반환 | P1 |
| TRANS-007 | API 키 미설정 시 | 에러 발생 | P1 |
| TRANS-008 | API 호출 실패 시 | 적절한 에러 메시지 | P2 |

```javascript
// TRANS-001: 한국어 → 영어 번역 테스트
describe('Translation Service', () => {
  test('should translate Korean to English', async () => {
    const response = await fetch('http://localhost:3000/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: '안녕하세요, 반갑습니다.',
        tone: 'professional'
      })
    });
    const data = await response.json();
    expect(data.translation).toBeTruthy();
    expect(data.detected_language).toBe('ko');
  });
});
```

### 3.2 클라이언트 사이드 단위 테스트

#### 3.2.1 Hooks 테스트

| 테스트 ID | 테스트 시나리오 | 예상 결과 | 우선순위 |
|-----------|----------------|----------|---------|
| HOOK-001 | useSocket 연결 상태 | connected 상태 반환 | P0 |
| HOOK-002 | useSocket 재연결 | 재연결 이벤트 발생 | P1 |
| HOOK-003 | useTranslation 번역 호출 | 번역 결과 반환 | P0 |
| HOOK-004 | useTranslation 에러 처리 | 에러 상태 설정 | P1 |

```javascript
// HOOK-001: useSocket 테스트
import { renderHook, act } from '@testing-library/react';
import { useSocket } from '../hooks/useSocket';

describe('useSocket Hook', () => {
  beforeEach(() => {
    localStorage.setItem('talklink_token', 'test-token');
    localStorage.setItem('talklink_room_id', '1');
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('should return socket connection status', async () => {
    const { result } = renderHook(() => useSocket(1));
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    expect(result.current).toBeDefined();
  });
});
```

#### 3.2.2 컴포넌트 테스트

| 테스트 ID | 테스트 시나리오 | 예상 결과 | 우선순위 |
|-----------|----------------|----------|---------|
| CMP-001 | MessageBubble 렌더링 (호스트) | 오른쪽 정렬 메시지 | P0 |
| CMP-002 | MessageBubble 렌더링 (게스트) | 왼쪽 정렬 메시지 | P0 |
| CMP-003 | MessageBubble 번역 표시 | 원문+번역 표시 | P1 |
| CMP-004 | MessageInput 빈 입력 검증 | 전송 버튼 비활성화 | P1 |
| CMP-005 | Sidebar 채팅방 목록 렌더링 | 채팅방 아이템 표시 | P0 |
| CMP-006 | Sidebar 새 채팅방 모달 | 모달 표시 | P1 |
| CMP-007 | Login 폼 검증 | 유효성 검사 에러 | P1 |
| CMP-008 | Settings API 키 저장 | 저장 성공 메시지 | P0 |

---

## 4. 통합 테스트 (Integration Tests)

### 4.1 API 통합 테스트

#### 4.1.1 인증 흐름

| 테스트 ID | 테스트 시나리오 | 예상 결과 | 우선순위 |
|-----------|----------------|----------|---------|
| INT-AUTH-001 | 호스트 회원가입 → 로그인 → JWT 검증 | 전체 흐름 성공 | P0 |
| INT-AUTH-002 | 잘못된 JWT로 API 호출 | 401 Unauthorized | P0 |
| INT-AUTH-003 | 만료된 JWT로 API 호출 | 401 Unauthorized | P1 |
| INT-AUTH-004 | 게스트 참여 → 메시지 전송 | 메시지 전송 성공 | P0 |

```javascript
// INT-AUTH-001: 전체 인증 흐름 테스트
describe('Authentication Flow', () => {
  let authToken;

  test('complete auth flow: register → login → verify', async () => {
    // 1. Register
    const registerRes = await fetch('http://localhost:3000/api/auth/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'e2e-test@example.com',
        password: 'password123',
        name: 'E2E Test User',
        profile: { skills: ['React'] }
      })
    });
    expect(registerRes.ok).toBe(true);

    // 2. Login
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'e2e-test@example.com',
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    expect(loginData.token).toBeDefined();
    authToken = loginData.token;

    // 3. Verify Token
    const verifyRes = await fetch('http://localhost:3000/api/auth/me', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    expect(verifyRes.ok).toBe(true);
  });
});
```

#### 4.1.2 채팅방 흐름

| 테스트 ID | 테스트 시나리오 | 예상 결과 | 우선순위 |
|-----------|----------------|----------|---------|
| INT-ROOM-001 | 채팅방 생성 → 참여 → 메시지 전송 | 전체 흐름 성공 | P0 |
| INT-ROOM-002 | 초대 링크로 참여 | 게스트 참여 성공 | P0 |
| INT-ROOM-003 | 다중 참여자 메시지 동기화 | 실시간 동기화 | P1 |
| INT-ROOM-004 | 채팅방 삭제 | 관련 데이터 삭제 | P1 |

#### 4.1.3 번역 흐름

| 테스트 ID | 테스트 시나리오 | 예상 결과 | 우선순위 |
|-----------|----------------|----------|---------|
| INT-TRANS-001 | 메시지 전송 → 번역 저장 → 조회 | 번역 결과 조회 | P0 |
| INT-TRANS-002 | 번역 캐시 효과 | 캐시된 결과 반환 | P2 |
| INT-TRANS-003 | 번역 기록 조회 | 히스토리 목록 | P1 |

### 4.2 Socket.io 통합 테스트

| 테스트 ID | 테스트 시나리오 | 예상 결과 | 우선순위 |
|-----------|----------------|----------|---------|
| INT-SOCKET-001 | 소켓 연결 → 방 참여 | join_room 성공 | P0 |
| INT-SOCKET-002 | 메시지 전송 → 수신 | new_message 이벤트 | P0 |
| INT-SOCKET-003 | 타이핑 이벤트 전파 | typing 이벤트 수신 | P1 |
| INT-SOCKET-004 | 재연결 처리 | 메시지 재동기화 | P2 |
| INT-SOCKET-005 | 방 이탈 처리 | leave_room 처리 | P1 |

---

## 5. E2E 테스트 (End-to-End Tests)

### 5.1 Playwright 테스트 스펙

```javascript
// playwright.config.js
module.exports = {
  testDir: './e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
  ],
};
```

#### 5.1.1 호스트 사용자 플로우

| 테스트 ID | 테스트 시나리오 | 예상 결과 | 우선순위 |
|-----------|----------------|----------|---------|
| E2E-HOST-001 | 회원가입 → API 키 설정 → 채팅방 생성 | 모든 단계 성공 | P0 |
| E2E-HOST-002 | 메시지 전송 → 번역 확인 | 번역 메시지 표시 | P0 |
| E2E-HOST-003 | 이메일 다듬기 기능 | 다듬어진 이메일 반환 | P1 |
| E2E-HOST-004 | 제안서 생성 | 제안서 생성 성공 | P1 |
| E2E-HOST-005 | AI 어시스턴트 검색 | 검색 결과 표시 | P1 |
| E2E-HOST-006 | 설정 변경 → 적용 | 설정 저장 확인 | P1 |

```javascript
// E2E-HOST-001: 호스트 전체 플로우
import { test, expect } from '@playwright/test';

test.describe('Host User Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('complete host flow: register → setup → create room', async ({ page }) => {
    // 1. Register
    await page.fill('#email', 'host@test.com');
    await page.fill('#password', 'password123');
    await page.fill('#name', 'Test Host');
    await page.click('button:has-text("회원가입")');
    
    // 2. Setup API Keys
    await page.click('button:has-text("설정")');
    await page.fill('input[placeholder*="OpenRouter"]', 'sk-test-key');
    await page.click('button:has-text("저장")');
    
    // 3. Create Room
    await page.click('button:has-text("새 채팅방")');
    await page.fill('input[placeholder*="채팅방 이름"]', 'Test Room');
    await page.click('button:has-text("만들기")');
    
    // Verify room created
    await expect(page.locator('text=Test Room')).toBeVisible();
  });
});
```

#### 5.1.2 게스트 사용자 플로우

| 테스트 ID | 테스트 시나리오 | 예상 결과 | 우선순위 |
|-----------|----------------|----------|---------|
| E2E-GUEST-001 | 초대 링크 접속 → 닉네임 입력 → 입장 | 입장 성공 | P0 |
| E2E-GUEST-002 | 메시지 전송 → 호스트 확인 | 메시지 동기화 | P0 |
| E2E-GUEST-003 | 다중 게스트 참여 | 참여자 목록 업데이트 | P1 |

```javascript
// E2E-GUEST-001: 게스트 참여 플로우
test('guest join flow', async ({ page }) => {
  // Navigate to invite link
  await page.goto('/join/ABC12345');
  
  // Enter nickname
  await page.fill('input[placeholder*="닉네임"]', 'Guest User');
  await page.click('button:has-text("참여하기")');
  
  // Verify joined
  await expect(page.locator('text=Guest User')).toBeVisible();
  await expect(page.locator('text=게스트 모드')).toBeVisible();
});
```

### 5.2 시나리오별 테스트

#### 5.2.1 번역 채팅 시나리오

```
시나리오: 한국어 → 영어 번역 채팅

1. 호스트가 메시지 입력 (한국어)
2 버튼. 전송 클릭
3. 번역 API 호출
4. 번역 결과 저장
5. 게스트에게 번역된 메시지 전송
6. 호스트에게는 원문+번역 표시
7. 게스트에게는 번역된 메시지만 표시
```

| 검증 포인트 | 예상 결과 |
|------------|----------|
| 번역 정확도 | 95%+ 일치율 |
| 응답 시간 | 3초 이내 |
| 메시지 동기화 | 양방향 실시간 |

#### 5.2.2 AI 어시스턴트 시나리오

```
시나리오: AI 어시스턴트 정보 검색

1. 클라이언트가 기술 용어 포함 질문
2. AI가 "정보 필요" 판단
3. 검색 버튼에 느낌표 뱃지 표시
4. 호스트가 검색 클릭
5. 웹 검색 + 이전 대화 검색
6. Assistant Panel에 결과 표시
7. 호스트가 제안 답변 사용
```

| 검증 포인트 | 예상 결과 |
|------------|----------|
| 검색 결과 관련성 | 상위 5개 중 3개 이상 관련 |
| 응답 시간 | 10초 이내 |
| UI 피드백 | 적절한 로딩/결과 표시 |

---

## 6. 수동 테스트 (Manual Tests)

### 6.1 기능별 체크리스트

#### 6.1.1 인증

| 항목 | 테스트 내용 | 결과 | 비고 |
|------|------------|------|------|
| 회원가입 | 유효한 정보로 회원가입 | ☐ | |
| | 중복 이메일 등록 시도 | ☐ | |
| | 유효하지 않은 이메일 형식 | ☐ | |
| 로그인 | 올바른 자격증명으로 로그인 | ☐ | |
| | 잘못된 비밀번호로 로그인 | ☐ | |
| | 존재하지 않는 이메일로 로그인 | ☐ | |
| 세션 | JWT 토큰 유효성 | ☐ | |
| | 로그아웃 처리 | ☐ | |

#### 6.1.2 채팅방

| 항목 | 테스트 내용 | 결과 | 비고 |
|------|------------|------|------|
| 생성 | 새 채팅방 생성 | ☐ | |
| | 초대 코드 생성 확인 | ☐ | |
| 참여 | 유효한 초대 코드로 참여 | ☐ | |
| | 닉네임 입력 | ☐ | |
| 메시지 | 메시지 전송 | ☐ | |
| | 번역 결과 확인 | ☐ | |
| | 메시지 복사 | ☐ | |
| 참여자 | 참여자 입장/퇴장 알림 | ☐ | |
| | 타이핑 인디케이터 | ☐ | |

#### 6.1.3 번역

| 항목 | 테스트 내용 | 결과 | 비고 |
|------|------------|------|------|
| 언어 감지 | 한국어 텍스트 감지 | ☐ | |
| | 영어 텍스트 감지 | ☐ | |
| | 혼합 언어 처리 | ☐ | |
| 번역 | 한국어 → 영어 | ☐ | |
| | 영어 → 한국어 | ☐ | |
| | 톤 적용 | ☐ | |
| 캐시 | 동일 텍스트 재번역 | ☐ | |

#### 6.1.4 이메일 모드

| 항목 | 테스트 내용 | 결과 | 비고 |
|------|------------|------|------|
| 다듬기 | 영어 이메일 다듬기 | ☐ | |
| | 톤 선택 적용 | ☐ | |
| | 복사 기능 | ☐ | |
| 요약 | 영어 이메일 요약 | ☐ | |
| | Action Items 추출 | ☐ | |
| | 숨은 의도 분석 | ☐ | |

#### 6.1.5 제안서 생성

| 항목 | 테스트 내용 | 결과 | 비고 |
|------|------------|------|------|
| 생성 | 채팅방 선택 | ☐ | |
| | 지시사항 입력 | ☐ | |
| | 제안서 생성 | ☐ | |
| 결과 | 제안서 내용 확인 | ☐ | |
| | 복사 기능 | ☐ | |

#### 6.1.6 AI 어시스턴트

| 항목 | 테스트 내용 | 결과 | 비고 |
|------|------------|------|------|
| 검색 | 웹 검색 실행 | ☐ | |
| | 이전 대화 검색 | ☐ | |
| UI | Panel 열기/닫기 | ☐ | |
| | 결과 렌더링 | ☐ | |
| 답변 | 제안 답변 사용 | ☐ | |

#### 6.1.7 설정

| 항목 | 테스트 내용 | 결과 | 비고 |
|------|------------|------|------|
| API 키 | OpenRouter 키 저장 | ☐ | |
| | Tavily 키 저장 | ☐ | |
| | Exa 키 저장 | ☐ | |
| | 키 가시성 토글 | ☐ | |
| 상태 | API 키 상태 표시 | ☐ | |

### 6.2 성능 테스트

| 항목 | 목표 | 측정 방법 |
|------|------|----------|
| 페이지 로딩 시간 | < 3초 | Lighthouse |
| 번역 응답 시간 | < 3초 | API 응답 시간 |
| 소켓 연결 시간 | < 1초 | 연결 수립 시간 |
| 메모리 사용량 | < 500MB | Chrome DevTools |

### 6.3 호환성 테스트

| 브라우저 | 버전 | 결과 |
|---------|------|------|
| Chrome | latest | ☐ |
| Firefox | latest | ☐ |
| Safari | latest | ☐ |
| Edge | latest | ☐ |

---

## 7. 테스트 실행 가이드

### 7.1 환경 설정

```bash
# 1. 의존성 설치
npm install

# 2. 테스트 환경 변수 설정
cp .env.example .env.test
# .env.test 파일에 API 키 설정

# 3. 데이터베이스 초기화
npm run setup
```

### 7.2 테스트 실행 명령어

```bash
# 단위 테스트만 실행
npm run test:unit

# 통합 테스트만 실행
npm run test:integration

# E2E 테스트 실행
npm run test:e2e

# 모든 테스트 실행
npm run test

# 특정 테스트 파일 실행
npm run test -- tests/db.test.js
```

### 7.3 테스트 커버리지 목표

| 카테고리 | 목표 커버리지 |
|----------|--------------|
| Statements | 80%+ |
| Branches | 75%+ |
| Functions | 80%+ |
| Lines | 80%+ |

---

## 8. 결함 관리

### 8.1 결함 심각도 분류

| 수준 | 설명 | 대응时限 |
|------|------|---------|
| P0 (Critical) | 시스템クラ쉬, 주요 기능 불가 | 4시간 |
| P1 (High) | 주요 기능 장애, 우회 불가 | 24시간 |
| P2 (Medium) | 일부 기능 장애, 우회 가능 | 1주일 |
| P3 (Low) | 경미한 버그, 개선 요청 | 백로그 |

### 8.2 결함 보고서 양식

```markdown
## 결함 보고서

### 기본 정보
- ID: BUG-001
- 우선순위: P1
- 상태: [Open/In Progress/Fixed/Closed]
- 작성자: [이름]
- 작성일: [날짜]

### 재현 정보
- 환경: [브라우저, OS, 버전]
- 재현 단계:
  1. [단계 1]
  2. [단계 2]
  3. [단계 3]
- 예상 결과: [정상 동작]
- 실제 결과: [현재 동작]

### 스크린샷/로그
[이미지 또는 로그]

### 할당 및 해결
- 담당자: [이름]
- 해결일: [날짜]
- 해결 방법: [설명]
```

---

## 9. 테스트 일정

| 단계 | 내용 | 기간 | 완료 예정일 |
|------|------|------|------------|
| 1 | 단위 테스트 구현 | 3일 | YYYY-MM-DD |
| 2 | 통합 테스트 구현 | 3일 | YYYY-MM-DD |
| 3 | E2E 테스트 구현 | 3일 | YYYY-MM-DD |
| 4 | 수동 테스트 수행 | 2일 | YYYY-MM-DD |
| 5 | 결함 수정 및 재테스트 | 2일 | YYYY-MM-DD |
| **합계** | | **13일** | |

---

## 10. 승인

| 역할 | 이름 | 서명 | 날짜 |
|------|------|------|------|
| 작성자 | | | |
| 검토자 | | | |
| 승인자 | | | |

---

*본 문서는 TalkLink 프로젝트의 테스트 기준을 제공하며, 프로젝트 진행에 따라 업데이트될 수 있습니다.*
