const express = require('express');
const axios = require('axios');
const fileUpload = require('express-fileupload');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Подключение к базе данных (ленивая инициализация)
let client;

async function getConnection() {
    if (!client) {
        client = new Client({
            connectionString: process.env.SUPABASE_URL,
            ssl: true
        });
        await client.connect();
        console.log("✅ Подключено к Supabase");
    }
    return client;
}

// Middleware
app.use(express.static('.'));
app.use(express.json());
app.use(fileUpload());

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Страницы
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

// API: Регистрация
app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        const dbClient = await getConnection();

        // Проверка дубликата
        const checkResult = await dbClient.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (checkResult.rows.length > 0) {
            return res.status(409).json({ error: "Пользователь с таким email уже существует" });
        }

        // Создание пользователя
        await dbClient.query(
            'INSERT INTO users (email, password) VALUES ($1, $2)',
            [email, password]
        );

        console.log("✅ Пользователь зарегистрирован:", email);
        res.json({ success: true });
    } catch (error) {
        console.error("❌ Ошибка регистрации:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// API: Вход
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const dbClient = await getConnection();

        const result = await dbClient.query(
            'SELECT * FROM users WHERE email = $1 AND password = $2',
            [email, password]
        );

        if (result.rows.length > 0) {
            console.log("✅ Пользователь вошёл:", email);
            res.json({ success: true });
        } else {
            res.status(401).json({ error: "Неверный логин или пароль" });
        }
    } catch (error) {
        console.error("❌ Ошибка входа:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// API: Выход
app.post('/api/logout', (req, res) => {
    res.json({ success: true });
});

// OAuth2: Подключение Авито
app.get('/auth/avito/callback', async (req, res) => {
    const code = req.query.code;

    try {
        // ⚠️ ИСПРАВЛЕНО: убран пробел в конце URL
        const tokenResponse = await axios.post('https://oauth.avito.ru/token', {
            grant_type: 'authorization_code',
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            code: code,
            redirect_uri: process.env.REDIRECT_URI
        }, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const accessToken = tokenResponse.data.access_token;
        console.log("🔑 Получен токен Авито:", accessToken);

        res.send(`
            <h1>✅ Успешно подключено!</h1>
            <p>Токен: ${accessToken}</p>
            <a href="/" class="btn btn-primary">Вернуться на сайт</a>
        `);
    } catch (error) {
        console.error("❌ Ошибка OAuth:", error.message);
        res.status(500).send("Ошибка авторизации: " + error.message);
    }
});

// API: Загрузка файла в Авито
app.post('/api/upload', async (req, res) => {
    if (!req.files || !req.files.file) {
        return res.status(400).json({ error: "Файл не выбран" });
    }

    const file = req.files.file;
    const accessToken = "СЮДА_ТОКЕН_ПОЛЬЗОВАТЕЛЯ"; // ← Позже будем брать из БД

    try {
        const formData = new FormData();
        formData.append('file', file.data, file.name);

        // ⚠️ ИСПРАВЛЕНО: убран пробел в конце URL
        const uploadResponse = await axios.post('https://api.avito.ru/core/v1/items/upload', formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${accessToken}`
            }
        });

        res.json({ file_key: uploadResponse.data.file_key });
    } catch (error) {
        console.error("❌ Ошибка загрузки:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
