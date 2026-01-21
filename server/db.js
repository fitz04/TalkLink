const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'talklink.db');

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
});

db.serialize(() => {
  db.run("PRAGMA journal_mode = WAL");
  db.run("PRAGMA synchronous = NORMAL");

  db.run(`
    CREATE TABLE IF NOT EXISTS host (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      profile TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS chat_rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      invite_code TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
      nickname TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      language TEXT DEFAULT 'en',
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
      sender_type TEXT NOT NULL,
      sender_id INTEGER,
      original_text TEXT NOT NULL,
      translated_text TEXT,
      original_language TEXT,
      tone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE VIRTUAL TABLE IF NOT EXISTS messages_fts USING fts5(
      original_text, 
      translated_text, 
      content=messages, 
      content_rowid=id
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS email_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      input_text TEXT NOT NULL,
      output_text TEXT NOT NULL,
      mode TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS assistant_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER REFERENCES chat_rooms(id),
      query TEXT NOT NULL,
      web_results TEXT,
      chat_results TEXT,
      suggested_reply TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS proposal_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_ids TEXT NOT NULL,
      instructions TEXT,
      proposal TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_type, sender_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_participants_room ON participants(room_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_participants_token ON participants(token)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_rooms_invite_code ON chat_rooms(invite_code)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_assistant_room ON assistant_history(room_id)`);

  db.run(`
    CREATE TRIGGER IF NOT EXISTS messages_ai AFTER INSERT ON messages
    BEGIN
      INSERT INTO messages_fts(rowid, original_text, translated_text)
      VALUES (new.id, new.original_text, new.translated_text);
    END
  `);

  db.run(`
    CREATE TRIGGER IF NOT EXISTS messages_ad AFTER DELETE ON messages
    BEGIN
      INSERT INTO messages_fts(messages_fts, rowid, original_text, translated_text)
      VALUES ('delete', old.id, old.original_text, old.translated_text);
    END
  `);

  db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('search_provider', 'tavily')`);
  db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('default_tone', 'professional')`);

  if (process.env.OPENROUTER_API_KEY) {
    db.run(`INSERT OR REPLACE INTO settings (key, value) VALUES ('openrouter_api_key', ?)`, [process.env.OPENROUTER_API_KEY]);
    console.log('✅ OpenRouter API key loaded from .env');
  }
  if (process.env.TAVILY_API_KEY) {
    db.run(`INSERT OR REPLACE INTO settings (key, value) VALUES ('tavily_api_key', ?)`, [process.env.TAVILY_API_KEY]);
    console.log('✅ Tavily API key loaded from .env');
  }
  if (process.env.EXA_API_KEY) {
    db.run(`INSERT OR REPLACE INTO settings (key, value) VALUES ('exa_api_key', ?)`, [process.env.EXA_API_KEY]);
    console.log('✅ Exa API key loaded from .env');
  }
});

db.getHostByEmail = function (email, callback) {
  this.get('SELECT * FROM host WHERE email = ?', [email], (err, row) => {
    callback(err, row);
  });
};

db.getHostById = function (id, callback) {
  this.get('SELECT * FROM host WHERE id = ?', [id], (err, row) => {
    callback(err, row);
  });
};

db.createHost = function (email, passwordHash, name, profile, callback) {
  const self = this;
  this.run(
    'INSERT INTO host (email, password_hash, name, profile) VALUES (?, ?, ?, ?)',
    [email, passwordHash, name, profile],
    function (err) {
      if (err) return callback(err);
      self.getHostById(this.lastID, callback);
    }
  );
};

db.getSetting = function (key, callback) {
  this.get('SELECT value FROM settings WHERE key = ?', [key], (err, row) => {
    callback(err, row ? row.value : null);
  });
};

db.setSetting = function (key, value, callback) {
  this.run(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    [key, value],
    callback
  );
};

db.getAllSettings = function (callback) {
  this.all('SELECT key, value FROM settings', (err, rows) => {
    if (err) return callback(err);
    const settings = {};
    rows.forEach(row => { settings[row.key] = row.value; });
    callback(null, settings);
  });
};

db.getChatRoomById = function (id, callback) {
  this.get('SELECT * FROM chat_rooms WHERE id = ?', [id], callback);
};

db.getChatRoomByInviteCode = function (inviteCode, callback) {
  this.get('SELECT * FROM chat_rooms WHERE invite_code = ?', [inviteCode], callback);
};

db.createChatRoom = function (name, inviteCode, callback) {
  const self = this;
  this.run(
    'INSERT INTO chat_rooms (name, invite_code) VALUES (?, ?)',
    [name, inviteCode],
    function (err) {
      if (err) return callback(err);
      // 'this' here is the RunResult object with lastID
      const roomId = this.lastID;
      self.getChatRoomById(roomId, callback);
    }
  );
};

db.getChatRooms = function (callback) {
  this.all(`
    SELECT cr.*, 
      (SELECT COUNT(*) FROM participants WHERE room_id = cr.id) as participant_count,
      (SELECT COUNT(*) FROM messages WHERE room_id = cr.id) as message_count,
      (SELECT original_text FROM messages WHERE room_id = cr.id ORDER BY created_at DESC LIMIT 1) as last_message
    FROM chat_rooms cr
    ORDER BY updated_at DESC
  `, callback);
};

db.deleteChatRoom = function (id, callback) {
  this.run('DELETE FROM chat_rooms WHERE id = ?', [id], callback);
};

db.getParticipantByToken = function (token, callback) {
  this.get(`
    SELECT p.*, cr.name as room_name 
    FROM participants p 
    JOIN chat_rooms cr ON p.room_id = cr.id
    WHERE p.token = ?
  `, [token], callback);
};

db.getParticipantById = function (id, callback) {
  this.get(`
    SELECT p.*, cr.name as room_name 
    FROM participants p 
    JOIN chat_rooms cr ON p.room_id = cr.id
    WHERE p.id = ?
  `, [id], callback);
};

db.createParticipant = function (roomId, nickname, token, language, callback) {
  const self = this;
  this.run(
    'INSERT INTO participants (room_id, nickname, token, language) VALUES (?, ?, ?, ?)',
    [roomId, nickname, token, language],
    function (err) {
      if (err) return callback(err);
      const participantId = this.lastID;
      self.getParticipantById(participantId, callback);
    }
  );
};

db.getParticipantsByRoom = function (roomId, callback) {
  this.all('SELECT * FROM participants WHERE room_id = ? ORDER BY joined_at', [roomId], callback);
};

db.getMessagesByRoom = function (roomId, limit, callback) {
  this.all(
    'SELECT * FROM messages WHERE room_id = ? ORDER BY created_at ASC LIMIT ?',
    [roomId, limit || 100],
    callback
  );
};

db.createMessage = function (roomId, senderType, originalText, translatedText, originalLanguage, tone, senderId, callback) {
  const self = this;
  this.run(
    `INSERT INTO messages (room_id, sender_type, sender_id, original_text, translated_text, original_language, tone)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [roomId, senderType, senderId, originalText, translatedText, originalLanguage, tone],
    function (err) {
      if (err) return callback(err);
      // 'this' refers to the RunResult object here, which has lastID
      const messageId = this.lastID;
      self.get('SELECT * FROM messages WHERE id = ?', [messageId], (err2, message) => {
        if (err2) return callback(err2);

        self.run('UPDATE chat_rooms SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [roomId]);

        callback(null, message);
      });
    }
  );
};

db.searchMessagesFts = function (roomId, query, callback) {
  this.all(`
    SELECT m.* FROM messages m
    JOIN messages_fts fts ON m.id = fts.rowid
    WHERE m.room_id = ? AND messages_fts MATCH ?
    ORDER BY m.created_at DESC
    LIMIT 20
  `, [roomId, query], callback);
};

db.getTemplates = function (callback) {
  this.all('SELECT * FROM templates ORDER BY created_at DESC', callback);
};

db.createTemplate = function (title, content, category, callback) {
  const self = this;
  this.run(
    'INSERT INTO templates (title, content, category) VALUES (?, ?, ?)',
    [title, content, category],
    function (err) {
      if (err) return callback(err);
      const templateId = this.lastID;
      self.get('SELECT * FROM templates WHERE id = ?', [templateId], callback);
    }
  );
};

db.updateTemplate = function (id, title, content, category, callback) {
  const self = this;
  this.run(
    'UPDATE templates SET title = ?, content = ?, category = ? WHERE id = ?',
    [title, content, category, id],
    function (err) {
      if (err) return callback(err);
      self.get('SELECT * FROM templates WHERE id = ?', [id], callback);
    }
  );
};

db.deleteTemplate = function (id, callback) {
  this.run('DELETE FROM templates WHERE id = ?', [id], callback);
};

db.saveEmailHistory = function (inputText, outputText, mode, callback) {
  this.run(
    'INSERT INTO email_history (input_text, output_text, mode) VALUES (?, ?, ?)',
    [inputText, outputText, mode],
    callback
  );
};

db.getEmailHistory = function (limit, callback) {
  this.all('SELECT * FROM email_history ORDER BY created_at DESC LIMIT ?', [limit || 20], callback);
};

db.saveAssistantHistory = function (roomId, query, webResults, chatResults, suggestedReply, callback) {
  this.run(
    'INSERT INTO assistant_history (room_id, query, web_results, chat_results, suggested_reply) VALUES (?, ?, ?, ?, ?)',
    [roomId, query, JSON.stringify(webResults), JSON.stringify(chatResults), suggestedReply],
    callback
  );
};

db.saveProposalHistory = function (roomIds, instructions, proposal, callback) {
  this.run(
    'INSERT INTO proposal_history (room_ids, instructions, proposal) VALUES (?, ?, ?)',
    [JSON.stringify(roomIds), instructions || '', proposal],
    callback
  );
};

db.getProposalHistory = function (callback) {
  this.all('SELECT * FROM proposal_history ORDER BY created_at DESC LIMIT 20', callback);
};

console.log('✅ Database initialized successfully');
console.log(`   Path: ${dbPath}`);

module.exports = db;
