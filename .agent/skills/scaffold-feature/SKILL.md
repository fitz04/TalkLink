---
name: scaffold-feature
description: 새로운 풀스택 기능(DB 모델, API 라우트, React 컴포넌트)을 스캐폴딩합니다.
---

# 새 기능 스캐폴딩 (Scaffold New Feature)

TalkLink 프로젝트의 패턴을 준수하며 일관성 있게 새로운 기능을 추가하기 위한 보일러플레이트 코드를 생성합니다.

## 사용법 (Usage)

애플리케이션에 새로운 기능적 엔티티(예: "노트 기능 추가")를 추가하고 싶을 때 이 스킬을 실행하세요.
`FeatureName` (PascalCase, 예: "Notes")과 `Description`(설명)을 제공해야 합니다.

## 워크플로우 단계 (Workflow Steps)

### 1. 기능 구조 계획

- 요청을 분석하여 데이터베이스 모델에 필요한 필드를 결정합니다.
- 필요한 API 엔드포인트(CRUD)를 식별합니다.
- React 컴포넌트 인터페이스를 설계합니다.

### 2. 데이터베이스 모델 및 API 라우트 생성

- `server/routes/[featureName_lowercase].js` 파일을 생성합니다.
- **Rules 적용**: `api-guidelines.md`에 따라 `try/catch` 래핑과 적절한 에러 응답을 보장합니다.
- **제약 사항**: 우리는 SQLite와 원시 쿼리(또는 헬퍼)를 사용하므로, 테이블이 존재하지 않을 경우 생성하는 SQL과 엔드포인트 로직을 구현합니다.
  *(참고: 기존 패턴은 `server/db.js`를 확인하세요. 테이블 추가가 필요한 경우 `server/db.js`를 수정하거나 마이그레이션 스크립트를 실행해야 할 수 있습니다. 이 스킬에서는 편의상 라우트 내부나 `db.js` 초기화 시점에 테이블 생성 체크를 추가하거나, 사용자에게 안내합니다.)*
- **Action**: TalkLink의 단순성을 위해 `server/db.js`를 업데이트하거나 `db.run`을 사용하여 라우트 로직을 추가합니다.

### 3. 라우트 등록

- `server/server.js`를 수정하여 새 라우트를 마운트합니다: `app.use('/api/[featureName_lowercase]', require('./routes/[featureName_lowercase]'));`.

### 4. 프론트엔드 컴포넌트 생성

- `client/src/components/[FeatureName]/[FeatureName]Panel.jsx`를 생성합니다.
- 새 API를 호출하는 `fetch`가 포함된 기본 UI를 구현합니다.
- 프로젝트의 기존 UI 컴포넌트나 스타일링을 사용합니다.

### 5. 검증 (Verification)

- 서버가 에러 없이 시작되는지 확인합니다 (문법 체크).
- 새 파일 경로가 정확한지 확인합니다.

## 결과 보고 (Report)

- 생성된 파일 목록을 나열합니다.
- 생성된 API 엔드포인트 요약을 제공합니다.
- `server.js`가 수정되었다면 서버를 재시작해야 함을 사용자에게 상기시킵니다 (nodemon이 처리할 수도 있음).
