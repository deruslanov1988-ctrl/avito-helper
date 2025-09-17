const express = require('express');
const axios = require('axios');
const fileUpload = require('express-fileupload');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

const CLIENT_ID = "ТВОЙ_CLIENT_ID_ЗДЕСЬ"; // ← Вставь свой
const CLIENT_SECRET = "ТВОЙ_CLIENT_SECRET_ЗДЕСЬ"; // ← Вставь свой
const REDIRECT_URI = "https://ТВОЙ_САЙТ.render.com/auth/avito/callback"; // ← Позже поменяешь

app.use(express.static(path.join(__dirname, '../frontend')));
app.use(fileUpload());

// Шаг 1: Обработка OAuth2 — получение кода → обмен на токен
app.get('/auth/avito/callback', async (req, res) => {
    const code = req.query.code;

    try {
        const tokenResponse = await axios.post('https://oauth.avito.ru/token', {
            grant_type: 'authorization_code',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code: code,
            redirect_uri: REDIRECT_URI
        }, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const accessToken = tokenResponse.data.access_token;
        console.log("Получен токен:", accessToken);

        res.send(`
            <h1>✅ Успешно подключено!</h1>
            <p>Токен: ${accessToken}</p>
            <a href="/">Вернуться на сайт</a>
        `);
    } catch (error) {
        res.status(500).send("Ошибка авторизации: " + error.message);
    }
});

// Шаг 2: Загрузка файла в Авито
app.post('/api/upload', async (req, res) => {
    if (!req.files || !req.files.file) {
        return res.status(400).json({ error: "Файл не выбран" });
    }

    const file = req.files.file;
    const accessToken = "СЮДА_ТОКЕН_ПОЛЬЗОВАТЕЛЯ"; // ← Позже будем брать из БД

    try {
        const formData = new FormData();
        formData.append('file', file.data, file.name);

        const uploadResponse = await axios.post('https://api.avito.ru/core/v1/items/upload', formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${accessToken}`
            }
        });

        res.json({ file_key: uploadResponse.data.file_key });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});