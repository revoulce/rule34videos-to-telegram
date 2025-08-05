// popup.js

document.addEventListener('DOMContentLoaded', () => {
    const extractButton = document.getElementById('extractAndSend');
    const statusDiv = document.getElementById('status');

    extractButton.addEventListener('click', async () => {
        statusDiv.textContent = 'Extracting data...';
        statusDiv.className = '';

        // Получаем активную вкладку
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tab || !tab.url.startsWith('https://rule34video.com/video/')) {
            statusDiv.textContent = 'Please navigate to a rule34video.com video page.';
            statusDiv.className = 'error';
            return;
        }

        try {
            // Внедряем content.js (если он еще не внедрен) и выполняем функцию extractVideoData
            // Это более явный способ, чем просто полагаться на window.onload в content.js
            // и позволяет инициировать процесс по требованию пользователя.
            const results = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js'] // Убедимся, что content.js загружен
            });

            // После загрузки content.js, можно отправить ему сообщение, чтобы он начал извлечение
            // Или, как в нашем случае, content.js сам отправляет данные при загрузке страницы.
            // Здесь мы просто ждем, что background.js получит данные.

            statusDiv.textContent = 'Data extraction initiated. Check background console for WebSocket status.';
            statusDiv.className = 'success';

        } catch (error) {
            statusDiv.textContent = `Error: ${error.message}`;
            statusDiv.className = 'error';
            console.error("Error executing script:", error);
        }
    });

    // Можно добавить слушатель для сообщений от background.js, чтобы обновлять статус в popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "dataSentToWebSocket") {
            statusDiv.textContent = `Data sent to server: ${request.status}`;
            statusDiv.className = request.status === 'success' ? 'success' : 'error';
        }
    });
});
