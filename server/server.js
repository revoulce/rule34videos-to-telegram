// server.js

const express = require('express');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const cors = require('cors'); // Импортируем cors

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Создаем Telegram бота
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Middleware для обработки JSON
app.use(express.json());
app.use(cors()); // Включаем CORS

// Запускаем HTTP сервер
const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Обработка POST-запроса для отправки видео
app.post('/send-video', async (req, res) => {
    const { title, contentUrl } = req.body;

    if (!title || !contentUrl) {
        return res.status(400).json({ status: 'error', message: 'Title and contentUrl are required.' });
    }

    // Скачиваем видео
    try {
        const videoResponse = await axios.get(contentUrl, { responseType: 'arraybuffer' });
        const videoBuffer = Buffer.from(videoResponse.data, 'binary');

        // Отправляем видео в Telegram
        await bot.sendVideo(CHAT_ID, videoBuffer, {
            caption: `Title: ${title}`,
            filename: `${title}.mp4`
        });

        return res.json({ status: 'success', message: 'Video sent to Telegram.' });
    } catch (error) {
        console.error('Error downloading or sending video:', error);
        return res.status(500).json({ status: 'error', message: 'Failed to send video.' });
    }
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
