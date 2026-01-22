const express = require('express');
const router = express.Router();
const db = require('../db');
const DiscordBotService = require('../services/discordBot');

// Get integration status for a room
router.get('/:roomId/integration', (req, res) => {
    const roomId = req.params.roomId;
    db.getDiscordIntegration(roomId, (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.json({ isActive: false });

        // Don't return the full token for security if possible, but for MVP local tool it's okay.
        // Or mask it: "MTE..."
        res.json({
            isActive: true,
            channelId: row.channel_id,
            botToken: row.bot_token // Returning full token so user can see what's saved (Local app)
        });
    });
});

// Update integration settings
router.post('/:roomId/integration', (req, res) => {
    const roomId = req.params.roomId;
    const { botToken, channelId, isActive } = req.body;

    if (!isActive) {
        // If disabling
        db.deleteDiscordIntegration(roomId, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            DiscordBotService.stopBot(roomId);
            res.json({ success: true, isActive: false });
        });
    } else {
        // If enabling/updating
        if (!botToken || !channelId) {
            return res.status(400).json({ error: 'Bot Token and Channel ID are required' });
        }

        db.saveDiscordIntegration(roomId, botToken, channelId, (err) => {
            if (err) return res.status(500).json({ error: err.message });

            // Restart the bot with new settings
            DiscordBotService.startBot(roomId, botToken, channelId);
            res.json({ success: true, isActive: true });
        });
    }
});

module.exports = router;
