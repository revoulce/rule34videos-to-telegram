// background.js

// Удаляем код, связанный с WebSocket
// let ws;
// const SERVER_ADDRESS = "ws://localhost:4000"; // Удалите эту строку

// Функция для отправки видео данных на сервер
function sendVideoData(videoData) {
    fetch('http://localhost:4000/send-video', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(videoData)
    })
        .then(response => response.json())
        .then(result => {
            console.log('Response from server:', result);
        })
        .catch(error => {
            console.error('Error sending video data:', error);
        });
}

// Слушаем сообщения от content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "videoDataExtracted") {
        console.log("Received video data from content script:", request.data);
        sendVideoData(request.data); // Отправляем данные на сервер
        sendResponse({ status: "success", message: "Data sent to server" });
    }
    return true; // Для асинхронных ответов нужно вернуть true
});
