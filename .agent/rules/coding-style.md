---
description: TalkLink Coding Style and Conventions
globs: "**/*.{js,jsx}"
alwaysOn: true
---
# Coding Style & Conventions

Follow these conventions to ensure code consistency and reduce review friction.

## Code Structure

- **Async/Await**: Use `async/await` over raw Promises/callbacks where possible (except for SQLite driver which demands callbacks).
- **Error Handling**: Wrap async route handlers in `try/catch` blocks.
- **Imports**:
  - Backend: `const module = require('module')`
  - Frontend: `import Module from 'module'`

## Naming

- **Variables/Functions**: `camelCase` (e.g., `getUser`, `isLoggedIn`)
- **Components**: `PascalCase` (e.g., `ChatRoom`, `MessageBubble`)
- **Files**:
  - Components: `PascalCase.jsx`
  - Utilities/Routes: `camelCase.js`

## Debugging

- Use `console.log` for simple debugging.
- Do NOT remove `console.error` in catch blocks.
- **Server Logs**: Use the project's custom `log()` function in `server/index.js` context if available.

## Comments

- Write comments in **Korean** (User preference) or English (if technical precision required).
- Document complex logic, especially in `db.js` and Socket handlers.
