---
description: 서버 측 API 라우트를 위한 가이드라인 (에러 처리 및 설정 포함)
globs: "server/routes/*.js"
alwaysOn: true
---

# API Route Guidelines

이 규칙은 `server/routes/*.js`의 모든 Express 라우트에 적용됩니다.

## 1. 에러 처리 (Error Handling)

- **필수**: 모든 비동기 라우트 핸들러를 `try/catch` 블록으로 감싸야 합니다.
- **필수**: 일관된 에러 응답 형식을 사용해야 합니다:

  ```json
  { "error": "사람이 읽을 수 있는 에러 메시지" }
  ```

- **금지**: 프로덕션 환경에서 원시 스택 트레이스(stack trace)나 데이터베이스 에러를 클라이언트에게 노출하지 마세요.

## 2. 설정 및 비밀값 (Configuration & Secrets)

- **금지**: API 키, 비밀값(secrets), 설정값을 절대 하드코딩하지 마세요.
- **필수**: 동적 설정에는 `db.getSetting('key')`를 사용하세요.
- **필수**: 정적 환경 변수에는 `process.env`를 사용하세요.

## 3. 응답 형식 (Response Format)

- 성공 응답은 명확하고 일관성 있어야 합니다.
- 메타데이터가 필요한 경우가 아니라면 불필요하게 성공 데이터를 감싸지 마세요.
  - 권장 (Good): `res.json({ users: [...] })`
  - 비권장 (Bad): `res.json({ status: 200, body: { data: { users: [...] } } })`
