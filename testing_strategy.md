# 효율적인 TDD 기반 테스트 전략

## 1. 배경 및 목적

- **문제점**: 기존 브라우저 제어 기반의 E2E 테스트는 실행 속도가 느리고, LLM Agent 사용 시 과도한 토큰을 소모함.
- **목표**: 유닛 테스트와 API 통합 테스트 위주의 TDD(Test Driven Development)를 도입하여 **빠른 피드백 루프**와 **비용 효율성**을 확보.

## 2. 기술 스택 (Tech Stack)

### Backend (Node.js/Express)

- **프레임워크**: `Jest`
- **HTTP 요청 검증**: `Supertest`
- **DB 모킹 여부**: SQLite 인메일 메모리 모드 또는 별도 테스트 DB 파일 사용 (`database.test.sqlite`)

### Frontend (React/Vite)

- **프레임워크**: `Vitest` (Vite 네이티브 호환, 빠름)
- **컴포넌트 렌더링 검증**: `@testing-library/react`
- **User Event 시뮬레이션**: `@testing-library/user-event`

## 3. 테스트 계층 구조 (Testing Pyramid)

### Level 1: 단위 테스트 (Unit Tests) - 70% 비중

- **대상**: 유틸리티 함수(번역, 포맷팅), 독립적인 컴포넌트(버튼, 입력창), DB 쿼리 함수.
- **특징**: 외부 의존성 없이 빠르게 실행.
- **예시**: `translateText()` 함수가 입력값에 따라 올바른 JSON을 파싱하는지 검증.

### Level 2: 통합 테스트 (Integration Tests) - 20% 비중

- **대상**: API 엔드포인트 (`/api/auth`, `/api/messages`), 컴포넌트 간 상호작용.
- **특징**: 실제 DB(또는 테스트 DB)와 통신하며 로직의 연결 유무 확인.
- **예시**: `POST /api/messages` 요청 시 DB에 저장이 되고 Socket 이벤트가 트리거 되는지 검증 (Supertest 사용).

### Level 3: E2E/수동 테스트 - 10% 비중

- **대상**: 핵심 사용자 시나리오 (회원가입 -> 채팅방 생성 -> 대화).
- **수행 방식**:
  - 자동화: Playwright (최소한의 Critical Path만 유지).
  - **수동**: 개발자가 기능 개발 직후 직접 '수동 테스트 절차서'에 따라 검증.

## 4. TDD 워크플로우 (Workflow)

1. **Red**: 실패하는 테스트 작성 (예: "번역 API 오류 시에도 메시지는 저장되어야 한다")
2. **Green**: 테스트를 통과하는 최소한의 코드 작성 (예: try-catch 블록 추가)
3. **Refactor**: 코드 개선 및 중복 제거.

## 5. 향후 계획

- `npm run test` 명령어로 전체 유닛/통합 테스트가 10초 이내에 수행되도록 환경 구성.
- 새로운 기능 추가 시, 화면을 띄우기 전에 테스트 코드부터 작성.
