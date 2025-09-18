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
