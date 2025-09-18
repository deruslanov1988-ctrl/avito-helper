const express = require('express');
const axios = require('axios');
const fileUpload = require('express-fileupload');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Отдавать статические файлы из корня
app.use(express.static('.'));
app.use(express.json()); // ← ЭТО ОБЯЗАТЕЛЬНО!

// Подключение к базе данных
require('dotenv').config();
const { Client } = require('pg');
const client = new Client({
    connectionString: process.env.SUPABASE_URL,
    ssl: true
});

// Обработка регистрации
app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        await client.connect();
        const result = await client.query(
            'INSERT INTO users (email, password) VALUES ($1, $2)',
            [email, password]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Обработка входа
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        await client.connect();
        const result = await client.query(
            'SELECT * FROM users WHERE email = $1 AND password = $2',
            [email, password]
        );

        if (result.rows.length > 0) {
            res.json({ success: true });
        } else {
            res.status(401).json({ error: "Неверный логин или пароль" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Обработка главной страницы
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ... остальной код (OAuth, загрузка файла) оставь без изменений
app.get('/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});



