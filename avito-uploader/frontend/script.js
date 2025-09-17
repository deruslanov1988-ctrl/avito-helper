const CLIENT_ID = "ТВОЙ_CLIENT_ID_ЗДЕСЬ"; // ← Вставь свой client_id
const CLIENT_SECRET = "ТВОЙ_CLIENT_SECRET_ЗДЕСЬ"; // ← Вставь свой CLIENT_SECRET
const REDIRECT_URI = "https://ТВОЙ_САЙТ.render.com/auth/avito/callback"; // ← Позже поменяешь

document.getElementById("connectAvito").onclick = function() {
    const authUrl = `https://oauth.avito.ru/token?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=items:write%20items:read`;
    window.location.href = authUrl;
};

document.getElementById("generateFile").onclick = function() {
    const sampleData = "id\ttitle\tprice\taddress\tdescription\tcategory\timages\tstatus\n1001\tiPhone 13\t50000\tМосква\tОтличное состояние\tТелефоны\thttps://example.com/1.jpg\tactive";
    const blob = new Blob([sampleData], { type: 'text/tab-separated-values;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.getElementById("downloadLink");
    link.href = url;
    link.download = "avito_upload.tsv";
    link.style.display = "block";
    link.click();
};

document.getElementById("uploadButton").onclick = function() {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];
    if (!file) {
        alert("Выберите файл!");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    fetch("/api/upload", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById("status").innerText = "Файл загружен! ID: " + data.file_key;
    })
    .catch(err => {
        document.getElementById("status").innerText = "Ошибка: " + err.message;
    });

};
