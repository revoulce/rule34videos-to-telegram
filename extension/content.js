// content.js

console.log("Content script loaded for rule34video.com");

function extractVideoData() {
    const data = {};
    let videoSchema; // Объявляем переменную здесь

    // 1. Название видео
    const titleElement = $('h1.title_video');
    if (titleElement.length) {
        data.title = titleElement.text().trim();
    }

    // 2. URL видео (из schema.org/VideoObject) - для 360p
    const scriptLdJson = $('script[type="application/ld+json"]');
    if (scriptLdJson.length) {
        try {
            videoSchema = JSON.parse(scriptLdJson.html());
            if (videoSchema && videoSchema.contentUrl) {
                data.contentUrl = videoSchema.contentUrl; // Извлекаем только URL
            }
        } catch (e) {
            console.error("Error parsing JSON-LD:", e);
        }
    }

    // Отправляем данные на сервер
    fetch('http://localhost:4000/send-video', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: data.title,
            contentUrl: data.contentUrl
        })
    })
        .then(response => response.json())
        .then(result => {
            console.log('Response from server:', result);
        })
        .catch(error => {
            console.error('Error sending video data:', error);
        });
}

// Функция для ожидания загрузки элемента
function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const interval = setInterval(() => {
            const element = document.querySelector(selector);
            if (element) {
                clearInterval(interval);
                resolve(element);
            } else if (Date.now() - startTime > timeout) {
                clearInterval(interval);
                reject(new Error(`Element ${selector} not found within ${timeout}ms`));
            }
        }, 100); // Проверяем каждые 100 мс
    });
}

// Отправляем данные в background script после загрузки страницы
window.addEventListener('load', async () => {
    try {
        await waitForElement('h1.title_video');
        extractVideoData();
    } catch (error) {
        console.error("Failed to extract video data:", error);
    }
});
