# Antigravity 에이전트: 고급 활용 가이드

이 가이드는 **Rules(규칙)**, **Skills(스킬)**, **MCP(Model Context Protocol)**를 사용하여 AI 코딩 에이전트의 잠재력을 100% 활용하는 방법을 설명합니다. 이미 기초적인 내용은 알고 계시므로, 실용적이고 효과적인 패턴 위주로 다룹니다.

---

## 1. Rules: 품질 및 일관성 강제 (Rules)

Rules는 에이전트가 특정 패턴의 파일을 편집하기 전에 **항상** 확인해야 하는 지침입니다.

### 언제 Rules를 사용하나요?

- **일관성**: "React 컴포넌트에서는 항상 `arrow function`을 사용하세요."
- **안전**: "절대 `.env` 파일을 커밋하거나 API 키를 하드코딩하지 마세요."
- **아키텍처**: "모든 데이터베이스 접근은 `db` 서비스를 통해야 합니다."
- **기술 스택 제약**: "스타일링에는 `Tailwind CSS`만 사용하고, raw CSS는 쓰지 마세요."

### 모범 사례 (Best Practices)

- **구체적인 Globs 사용**: `**/*` 대신 `server/routes/*.js`처럼 구체적인 범위를 지정하세요.
- **간결하게 유지**: 에이전트는 매 턴마다 이 규칙을 읽습니다. 짧은 불렛 포인트 목록이 가장 좋습니다.
- **예시 제공**: "잘못된 예(Bad)" vs "잘된 예(Good)" 코드 패턴을 보여주세요.

### 예시: 엄격한 API 에러 처리

`.agent/rules/api-guidelines.md` 파일을 생성합니다:

```markdown
---
description: 견고한 API 에러 처리 및 보안 보장
globs: "server/routes/*.js"
alwaysOn: true
---
# API Guidelines
- **Try-Catch**: 모든 비동기 라우트 핸들러는 try/catch로 감싸야 합니다.
- **응답 형식**: 
  - 성공: `{ success: true, data: ... }`
  - 에러: `{ error: "사용자 친화적인 메시지" }`
- **설정**: 절대 비밀(secret) 값을 하드코딩하지 마세요. `db.getSetting()` 또는 `process.env`를 사용하세요.
```

---

## 2. Skills: 복잡한 워크플로우 자동화 (Skills)

Skills는 복잡한 작업을 완료하기 위해 에이전트가 따르는 **단계별 표준 운영 절차(SOP)**입니다. 개발 프로세스를 위한 '매크로'라고 생각하시면 됩니다.

### 언제 Skills를 사용하나요?

- **보일러플레이트**: "새 기능 스캐폴딩 (DB + API + UI 생성)."
- **테스트**: "E2E 테스트를 실행하고 UI 회귀(regression)를 수정하세요."
- **마이그레이션**: "안전한 데이터베이스 마이그레이션 절차."

### 모범 사례 (Best Practices)

- **입력 파라미터**: 사용자가 제공해야 할 정보(예: "기능 이름")를 명확히 정의하세요.
- **검증 단계**: 에이전트가 자신의 작업을 스스로 점검(Self-check)하는 단계를 포함하세요.
- **참조 파일**: 템플릿으로 참고할 코드베이스 내의 "모범 사례(Gold Standard)" 파일들을 링크하세요.

### 예시: 기능 스캐폴딩 (Feature Scaffolding)

`.agent/skills/scaffold-feature/SKILL.md`를 생성하여 새로운 풀스택 기능(데이터베이스 모델 -> API 라우트 -> 프론트엔드 컴포넌트) 생성을 자동화합니다.

---

## 3. 워크플로우 최적화 (Workflow optimization)

- **작업 전 체크**: 복잡한 작업을 시작하기 전에 에이전트에게 요청하세요: *".agent/rules/tech-stack.md를 읽고 구현 계획을 세워줘."*
- **스킬 체이닝(Skill Chaining)**: 스킬을 조합할 수 있습니다. *"'게스트 모드' 기능을 스캐폴딩하고, 'test-e2e' 스킬을 실행해서 검증해줘."*

---

## 요약

| 기능 | 역할 | 비유 |
| :--- | :--- | :--- |
| **Rules** | 제약 & 준수 (Constraint & Compliance) | "Linter" 또는 "시니어 개발자의 코드 리뷰" |
| **Skills** | 자동화 & 프로세스 (Automation & Process) | "스크립트" 또는 "플레이북(Playbook)" |
| **Workflows** | 반복 업무 (Routine Tasks) | "Makefile" 또는 "CI/CD 파이프라인" |
