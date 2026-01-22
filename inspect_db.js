const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data/talklink.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

db.serialize(() => {
    console.log('--- Recent Messages ---');
    db.each("SELECT id, room_id, sender_type, sender_id, original_text FROM messages ORDER BY id DESC LIMIT 20", (err, row) => {
        if (err) console.error(err);
        console.log(row);
    });

    console.log('\n--- Recent Participants ---');
    db.each("SELECT id, room_id, nickname, token FROM participants ORDER BY id DESC LIMIT 5", (err, row) => {
        if (err) console.error(err);
        console.log(row);
    });

    console.log('\n--- Chat Rooms ---');
    db.each("SELECT id, name, invite_code FROM chat_rooms", (err, row) => {
        if (err) console.error(err);
        console.log(row);
    });
});

db.close();
