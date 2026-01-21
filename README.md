# 🌐 TalkLink (토크링크)

**TalkLink**는 언어의 장벽 없이 자유롭게 소통할 수 있는 **실시간 자동 번역 채팅 플랫폼**입니다.
Socket.io를 활용한 실시간 통신과 AI 기반 번역 기술을 결합하여, 서로 다른 언어를 사용하는 사용자들이 매끄럽게 대화할 수 있는 환경을 제공합니다.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![React](https://img.shields.io/badge/react-%5E18.2.0-blue.svg)

---

## ✨ 주요 기능 (Key Features)

* **💬 실시간 채팅**: Socket.io 기반의 지연 없는 메시지 전송
* **🌏 실시간 자동 번역**: 메시지 전송 시 수신자의 설정 언어로 즉시 번역
* **🔒 사용자 인증**: 회원가입, 로그인 및 JWT 기반 보안 인증
* **👥 채팅방 관리**: 자유로운 채팅방 생성 및 초대 코드를 통한 입장
* **🌓 모던 UI/UX**: React와 TailwindCSS를 활용한 깔끔하고 반응형 디자인
* **📜 대화 기록 저장**: SQLite 데이터베이스를 사용하여 대화 내용 영구 보존

## 🛠 기술 스택 (Tech Stack)

### Backend

* **Runtime**: Node.js
* **Framework**: Express.js
* **Real-time**: Socket.io
* **Database**: SQLite3
* **Auth**: JWT (JSON Web Token), bcryptjs

### Frontend

* **Framework**: React (Vite)
* **Styling**: TailwindCSS, Lucide React (Icons)
* **State Management**: React Hooks

---

## 🚀 시작하기 (Getting Started)

### 1. 필수 요건 (Prerequisites)

* Node.js (v18.0.0 이상 권장)
* npm (Node Package Manager)

### 2. 설치 (Installation)

프로젝트를 클론하고 의존성 패키지를 설치합니다.

```bash
# 레포지토리 클론
git clone https://github.com/your-username/talklink.git
cd TalkLink

# 백엔드 의존성 설치
npm install

# 프론트엔드 의존성 설치
cd client
npm install
cd ..
```

### 3. 환경 변수 설정 (Environment Setup)

루트 디렉토리에 `.env` 파일을 생성하고 필요한 API 키를 설정하세요.

```env
# .env 예시
PORT=3000
JWT_SECRET=your_jwt_secret_key
# 번역 API 키 (Tavily, OpenAI 등 설정에 따라)
TAVILY_API_KEY=your_key_here
```

### 4. 실행 (Running the App)

백엔드와 프론트엔드 서버를 각각 실행해야 원활한 개발이 가능합니다.

**Backend Server** (Port 3000)

```bash
npm run server
```

**Frontend Client** (Port 5173)
새 터미널 열기:

```bash
cd client
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속하여 확인합니다.

---

## 📂 프로젝트 구조 (Project Structure)

```
TalkLink/
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   ├── public/
│   └── ...
├── server/                 # Backend (Node.js + Express)
│   ├── routes/             # API Routes
│   ├── socket/             # Socket.io Handlers
│   ├── index.js            # Entry Point
│   └── ...
├── data/                   # SQLite Database
├── logs/                   # Server Logs
└── ...
```

## 📝 라이선스 (License)

This project is licensed under the MIT License.
