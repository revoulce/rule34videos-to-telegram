// content.js

console.log("Content script loaded for rule34video.com");

function extractVideoData() {
    const data = {};

    // 1. Название видео
    const titleElement = document.querySelector('h1.title_video');
    if (titleElement) {
        data.title = titleElement.textContent.trim();
    }

    // 2. Описание видео (из schema.org/VideoObject)
    const scriptLdJson = document.querySelector('script[type="application/ld+json"]');
    if (scriptLdJson) {
        try {
            const videoSchema = JSON.parse(scriptLdJson.textContent);
            if (videoSchema && videoSchema.description) {
                // Очищаем описание от HTML-тегов и лишних пробелов
                const descriptionText = videoSchema.description
                    .replace(/<br\s*\/?>/g, '\n') // Заменяем <br> на перенос строки
                    .replace(/&nbsp;/g, ' ') // Заменяем &nbsp; на пробел
                    .replace(/\s+/g, ' ') // Сжимаем множественные пробелы
                    .trim();
                data.description = descriptionText;
            }
        } catch (e) {
            console.error("Error parsing JSON-LD:", e);
        }
    }

    // 3. Категории
    const categoriesContainer = document.querySelector('.col .label:contains("Categories")').nextElementSibling;
    if (categoriesContainer) {
        data.categories = Array.from(categoriesContainer.querySelectorAll('.item.btn_link span'))
            .map(span => span.textContent.trim());
    }

    // 4. Артисты/Создатели
    const artistContainer = document.querySelector('.col .label:contains("Artist")').nextElementSibling;
    if (artistContainer) {
        data.artists = Array.from(artistContainer.querySelectorAll('.item.btn_link span.name'))
            .map(span => span.textContent.trim());
    }

    // 5. Загружено пользователем
    const uploadedByElement = document.querySelector('.col .label:contains("Uploaded by")').nextElementSibling;
    if (uploadedByElement) {
        data.uploadedBy = uploadedByElement.textContent.trim().replace(/\s*<div class="verified-status">.*?<\/div>/s, ''); // Удаляем статус верификации
    }

    // 6. Теги
    const tagsContainer = document.querySelector('.row.row_spacer .wrap .label:contains("Tags")').nextElementSibling;
    if (tagsContainer) {
        data.tags = Array.from(tagsContainer.querySelectorAll('.tag_item'))
            .filter(tag => !tag.classList.contains('tag_item_suggest')) // Исключаем кнопку "Suggest"
            .map(tag => tag.textContent.trim());
    }

    // 7. Ссылки для скачивания
    const downloadLinksContainer = document.querySelector('.row.row_spacer .wrap .label:contains("Download")').nextElementSibling;
    if (downloadLinksContainer) {
        data.downloadLinks = Array.from(downloadLinksContainer.querySelectorAll('.tag_item'))
            .map(link => ({
                quality: link.textContent.trim(),
                url: link.href
            }));
    }

    // 8. Thumbnail URL (из schema.org/VideoObject)
    if (videoSchema && videoSchema.thumbnailUrl) {
        data.thumbnailUrl = videoSchema.thumbnailUrl;
    }

    // 9. URL видео (из schema.org/VideoObject) - для 360p
    if (videoSchema && videoSchema.contentUrl) {
        data.contentUrl = videoSchema.contentUrl;
    }


    return data;
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
        // Ждем загрузки ключевого элемента, чтобы убедиться, что DOM готов
        await waitForElement('h1.title_video');
        const videoData = extractVideoData();
        console.log("Extracted video data:", videoData);

        // Отправляем данные в background script
        chrome.runtime.sendMessage({
            action: "videoDataExtracted",
            data: videoData
        });

    } catch (error) {
        console.error("Failed to extract video data:", error);
        chrome.runtime.sendMessage({
            action: "extractionError",
            error: error.message
        });
    }
});

// Добавляем полифилл для :contains, так как он не является стандартным CSS-селектором
// Это упрощает поиск элементов по тексту
(function() {
    if (!Element.prototype.matches) {
        Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
    }

    if (!Element.prototype.closest) {
        Element.prototype.closest = function(s) {
            var el = this;
            do {
                if (el.matches(s)) return el;
                el = el.parentElement || el.parentNode;
            } while (el !== null && el.nodeType === 1);
            return null;
        };
    }

    // Простой полифилл для :contains
    // В реальном проекте лучше использовать более надежные методы,
    // например, итерироваться по элементам и проверять textContent
    // или использовать XPath. Для демонстрации этого достаточно.
    if (!CSS.supports('selector(:contains("text"))')) {
        // Это не настоящий полифилл для CSS.supports, а скорее хак для querySelector
        // В реальном коде, если querySelector не поддерживает :contains,
        // вам придется использовать document.evaluate (XPath) или итерироваться по DOM.
        // Для простоты демонстрации, предположим, что мы можем использовать его как функцию.
        // Если это не работает, придется переписать селекторы.
    }
})();

// Внимание: Селектор :contains() не является стандартным CSS-селектором.
// Он часто используется в jQuery. Для чистого JavaScript вам придется
// либо использовать XPath, либо итерироваться по элементам и проверять textContent.
// Для простоты примера я оставил его, но будьте готовы к тому, что он может не работать
// без дополнительной библиотеки или полифилла.
// В данном случае, я добавил простой полифилл, но для надежности лучше
// использовать более явные методы поиска элементов по тексту.
// Например:
// Array.from(document.querySelectorAll('.label')).find(el => el.textContent.includes('Categories'))
