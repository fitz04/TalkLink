---
description: TalkLink Project Technology Stack Constraints
globs: "**/*"
alwaysOn: true
---
# TalkLink Technology Stack

This project uses a specific set of technologies. **Do not** deviate from this stack or suggest alternatives unless explicitly requested.

## Frontend

- **Framework**: React (Vite)
- **Styling**: Tailwind CSS (Use utility classes, avoid styled-components)
- **State Management**: React Context API / Custom Hooks (No Redux/Zustand)
- **API Client**: Native `fetch` (No Axios)
- **Language**: JavaScript (ESM)
- **Constraint**: **NO TypeScript**. Keep all code in `.js` or `.jsx`.

## Backend

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: SQLite3 (`sqlite3` package)
- **Real-time**: Socket.io
- **Language**: JavaScript (CommonJS `require`)
- **Logging**: Custom logger (or minimal console), do not install heavy loggers.

## General

- **OS**: WSL2 (Ubuntu) running on Windows.
- **Network**: Server on port 3000, Client on 5173. Proxy configured in Vite.
