# 🌐 TalkLink

<div align="center">

**TalkLink** is a **Real-time Automatic Translation Chat Platform** that breaks down language barriers.

Powered by Socket.io for real-time communication and advanced AI for instant translation, it enables seamless conversation between users speaking different languages (Korean ↔ English).

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/react-%5E18.2.0-61DAFB.svg)](https://reactjs.org)
[![Socket.io](https://img.shields.io/badge/socket.io-4.x-010101.svg)](https://socket.io)

[📖 Read in Korean (한국어)](README.ko.md)

</div>

---

## 📸 Screenshots

![TalkLink Screenshot](docs/talklink_discord.png)

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 💬 **Real-time Chat** | Zero-latency messaging powered by Socket.io |
| 🌏 **AI Translation** | Instant KR ↔ EN translation using multi-LLM (OpenRouter) |
| 🤖 **Discord Bot** | Bi-directional sync and translation with Discord channels |
| 🔒 **Secure Auth** | JWT-based authentication & secure session management |
| 🎫 **Guest Mode** | Easy anonymous access via invite codes |
| ⚙️ **Multi-Model** | Choose from GPT-4o, Claude 3.5, Gemini 2.0, etc. |
| 🌐 **i18n Support** | Fully localized UI (English / Korean) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18.0.0 or higher
- **OpenRouter API Key** (Required for translation)

### Quick Start (Windows) ⚡

Simply run the **`TalkLink_Start.bat`** file in the root directory!

It will automatically:

1. Install dependencies
2. Build the frontend
3. Start the server
4. Open your browser to `http://localhost:3000`

### Docker Support 🐳

Run with a single command:

```bash
docker compose up
```

### Manual Installation

```bash
# 1. Clone repository
git clone https://github.com/fitz04/TalkLink.git
cd TalkLink

# 2. Install dependencies
npm install
cd client && npm install && cd ..

# 3. Create .env file
echo PORT=3000 > .env
echo JWT_SECRET=your_secret >> .env
# Optional: OPENROUTER_API_KEY=sk-...

# 4. Run Production Build
npm run prod
```

---

## 📖 Usage

1. **Host**: Sign up, create a room, and share the **Invite Code**.
2. **Guest**: Click "Guest Login" and enter the code to join.
3. **Settings**: Click the gear icon to:
    - Set **OpenRouter API Key** (Required).
    - Change **AI Model** (GPT-4o, Claude 3.5, Gemini, etc.).
    - Switch **Language** (English / Korean).

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, Lucide React
- **Backend**: Node.js, Express, Socket.io, SQLite3
- **AI**: OpenRouter API (Access to OpenAI, Anthropic, Google models)

---

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
