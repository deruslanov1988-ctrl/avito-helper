const express = require('express');
const axios = require('axios');
const fileUpload = require('express-fileupload');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Отдавать статические файлы из корня
app.use(express.static('.'));

// Обработка главной страницы
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ... остальной код (OAuth, загрузка файла) оставь без изменений

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
