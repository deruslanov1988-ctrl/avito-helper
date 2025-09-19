// ... остальной код

// OAuth2: Подключение Авито
app.get('/auth/avito/callback', async (req, res) => {
    const code = req.query.code;

    try {
        // ✅ ИСПРАВЛЕНО: убран пробел в конце URL
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

        // ✅ ИСПРАВЛЕНО: убран пробел в конце URL
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
