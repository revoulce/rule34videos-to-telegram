// background.js

let ws;
const SERVER_ADDRESS = "ws://localhost:4000"; // Адрес вашего Node.js сервера

function connectWebSocket() {
    if (ws && ws.readyState === WebSocket.OPEN) {
        console.log("WebSocket already open.");
        return;
    }

    ws = new WebSocket(SERVER_ADDRESS);

    ws.onopen = () => {
        console.log("WebSocket connected to server:", SERVER_ADDRESS);
        // Можно отправить сообщение о подключении
        ws.send(JSON.stringify({ type: "extensionConnected" }));
    };

    ws.onmessage = (event) => {
        console.log("Message from server:", event.data);
        // Обработка сообщений от сервера (например, статус загрузки)
        // Можно отправить уведомление пользователю через popup.js
    };

    ws.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason);
        // Попытка переподключения через некоторое время
        setTimeout(connectWebSocket, 5000);
    };

    ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        ws.close(); // Закрываем соединение при ошибке, чтобы инициировать переподключение
    };
}

// Подключаемся к WebSocket при запуске Service Worker
connectWebSocket();

// Слушаем сообщения от content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "videoDataExtracted") {
        console.log("Received video data from content script:", request.data);
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "videoData", payload: request.data }));
            console.log("Video data sent to server via WebSocket.");
            // Можно отправить ответ content script, что данные отправлены
            sendResponse({ status: "success", message: "Data sent to server" });
        } else {
            console.warn("WebSocket not connected. Data not sent.");
            sendResponse({ status: "error", message: "Server not connected" });
            // Попытаться переподключиться, если не подключено
            connectWebSocket();
        }
    } else if (request.action === "extractionError") {
        console.error("Error during extraction:", request.error);
        // Можно отправить это на сервер или показать уведомление
    }
    // Для асинхронных ответов нужно вернуть true
    return true;
});

// Обработка установки расширения или обновления
chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed or updated.");
    connectWebSocket();
});

// Обработка активации расширения (например, когда пользователь открывает popup)
chrome.action.onClicked.addListener((tab) => {
    console.log("Extension icon clicked.");
    // Можно здесь инициировать повторное извлечение данных, если нужно
    // или просто убедиться, что WebSocket подключен
    connectWebSocket();
});
