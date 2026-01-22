const { Client, GatewayIntentBits, Events } = require('discord.js');
const db = require('../db');
const fs = require('fs');
const path = require('path');
const { translateText } = require('./translate');

const LOG_FILE = path.join(__dirname, '../../logs/discord-debug.log');

function logToFile(msg) {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${msg}\n`;
    try {
        fs.appendFileSync(LOG_FILE, logLine);
    } catch (e) {
        console.error('Failed to write to log file:', e);
    }
}

// In-memory storage for active bot clients: { roomId: { client, channelId } }
const activeBots = {};

// Reference to the Socket.IO instance (set via init)
let ioInstance = null;

const DiscordBotService = {
    init: (io) => {
        ioInstance = io;
        logToFile('🤖 DiscordBotService initialized');

        // Load all active integrations from DB and start bots
        db.getAllActiveDiscordIntegrations((err, rows) => {
            if (err) {
                logToFile(`ERROR: Failed to load Discord integrations: ${err.message}`);
                return;
            }
            logToFile(`Found ${rows.length} active integrations in DB.`);
            rows.forEach(row => {
                DiscordBotService.startBot(row.room_id, row.bot_token, row.channel_id);
            });
        });
    },

    startBot: async (roomId, token, channelId) => {
        // If a bot is already running for this room, stop it first (re-initialization)
        if (activeBots[roomId]) {
            await DiscordBotService.stopBot(roomId);
        }

        logToFile(`Attempting to start bot for Room ${roomId} with Channel ID ${channelId}`);

        const client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
            ],
        });

        client.once(Events.ClientReady, c => {
            logToFile(`✅ Discord Bot Ready for Room ${roomId}: Logged in as ${c.user.tag}`);
            activeBots[roomId] = { client, channelId };
        });

        client.on(Events.MessageCreate, async message => {
            // Ignore messages from the bot itself to prevent loops
            if (message.author.bot) return;

            // Normalize channel IDs (sometimes they are strings vs numbers, usually strings in JS)
            const msgChannelId = message.channelId;

            logToFile(`🔍 [DEBUG] Msg Rx in Channel ${msgChannelId} (Expected: ${channelId})`);

            // Ignore messages from other channels
            if (msgChannelId !== channelId) {
                logToFile(`⚠️ Channel ID mismatch. Skipping. Msg Channel: ${msgChannelId}, Config Channel: ${channelId}`);
                return;
            }

            logToFile(`📩 Discord Message in Room ${roomId}: ${message.content}`);

            // Translate the message
            const tone = 'professional'; // Default tone for Discord messages
            const translationResult = await translateText(db, message.content, tone);
            const translatedText = translationResult.translation;
            const detectedLanguage = translationResult.detected_language;

            // Save to TalkLink DB
            const senderName = message.author.username;

            db.createMessage(
                roomId,
                'discord', // sender_type
                message.content, // original_text
                translatedText, // translated_text 
                detectedLanguage || 'en', // original_language 
                tone, // tone
                null, // sender_id 
                (err, savedMsg) => {
                    if (err) {
                        logToFile(`ERROR: Failed to save Discord message to DB: ${err.message}`);
                        return;
                    }

                    // Broadcast to TalkLink frontend via Socket.IO
                    if (ioInstance) {
                        logToFile(`Broadcasting message ${savedMsg.id} to room_${roomId}`);
                        ioInstance.to(`room_${roomId}`).emit('new_message', {
                            id: savedMsg.id,
                            sender_type: 'discord',
                            senderName: senderName, // Display name from Discord
                            original_text: savedMsg.original_text,
                            translated_text: savedMsg.translated_text,
                            created_at: savedMsg.created_at
                        });
                    }
                }
            );
        });

        try {
            await client.login(token);
        } catch (error) {
            logToFile(`❌ Failed to login Discord bot for Room ${roomId}: ${error.message}`);
        }
    },

    stopBot: async (roomId) => {
        if (activeBots[roomId]) {
            try {
                await activeBots[roomId].client.destroy();
                delete activeBots[roomId];
                logToFile(`🛑 Discord Bot for Room ${roomId} stopped.`);
            } catch (error) {
                logToFile(`Error stopping bot for Room ${roomId}: ${error.message}`);
            }
        }
    },

    sendMessageToDiscord: async (roomId, text, senderName) => {
        logToFile(`sendMessageToDiscord called for Room ${roomId}, Sender: ${senderName}, Text: ${text}`);
        const bot = activeBots[roomId];
        if (!bot) {
            logToFile(`Cannot send to Discord: No active bot for Room ${roomId}`);
            return;
        }

        try {
            const channel = await bot.client.channels.fetch(bot.channelId);
            if (channel) {
                await channel.send(`**${senderName}**: ${text}`);
                logToFile(`Sent message to Discord Room ${roomId}: ${text}`);
            } else {
                logToFile(`Channel ${bot.channelId} not found for Room ${roomId}`);
            }
        } catch (error) {
            logToFile(`Failed to send message to Discord Room ${roomId}: ${error.message}`);
        }
    }
};

module.exports = DiscordBotService;
