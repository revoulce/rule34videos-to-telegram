(() => {
    // Функция для создания кнопки
    function createDownloadButton() {
        const existingBtn = document.getElementById('r34-download-btn');
        if (existingBtn) return existingBtn;

        const btn = document.createElement('button');
        btn.id = 'r34-download-btn';
        btn.textContent = 'Скачать и отправить в Telegram';
        btn.style.position = 'fixed';
        btn.style.top = '100px';
        btn.style.right = '20px';
        btn.style.zIndex = '10000';
        btn.style.padding = '10px 15px';
        btn.style.backgroundColor = '#d1404a';
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.borderRadius = '5px';
        btn.style.cursor = 'pointer';
        document.body.appendChild(btn);
        return btn;
    }

    // Функция для парсинга данных видео
    function parseVideoData() {
        const title = document.querySelector('h1.title_video')?.textContent.trim() || '';
        const infoBlock = document.getElementById('tab_video_info');
        if (!infoBlock) return null;

        // Время публикации
        let publishTime = '';
        // Просмотры
        let views = '';
        // Длительность
        let duration = '';
        // Описание
        let description = '';
        // Категории, артисты, теги
        const categories = [];
        const artists = [];
        const tags = [];

        // Парсим item_info блоки
        const itemInfos = infoBlock.querySelectorAll('.item_info');
        itemInfos.forEach(div => {
            if (div.querySelector('svg.custom-calendar')) {
                publishTime = div.querySelector('span')?.textContent.trim() || '';
            } else if (div.querySelector('svg.custom-eye')) {
                views = div.querySelector('span')?.textContent.trim() || '';
            } else if (div.querySelector('svg.custom-time')) {
                duration = div.querySelector('span')?.textContent.trim() || '';
            }
        });

        // Описание
        const descElem = infoBlock.querySelector('.row .label em');
        if (descElem) description = descElem.textContent.trim();

        // Категории
        const categoryElems = Array.from(infoBlock.querySelectorAll('.col')).find(col => {
            const label = col.querySelector('.label');
            return label && label.textContent.includes('Categories');
        });
        if (categoryElems) {
            categoryElems.querySelectorAll('a.item.btn_link').forEach(a => {
                categories.push({ name: a.textContent.trim(), url: a.href });
            });
        }

        // Артисты
        const artistElems = Array.from(infoBlock.querySelectorAll('.col')).find(col => {
            const label = col.querySelector('.label');
            return label && label.textContent.includes('Artist');
        });
        if (artistElems) {
            artistElems.querySelectorAll('a.item.btn_link').forEach(a => {
                artists.push({ name: a.textContent.trim(), url: a.href });
            });
        }

        // Теги
        const tagRow = Array.from(infoBlock.querySelectorAll('.row.row_spacer')).find(row => {
            const label = row.querySelector('.label');
            return label && label.textContent.includes('Tags');
        });
        if (tagRow) {
            tagRow.querySelectorAll('a.tag_item').forEach(a => {
                tags.push({ name: a.textContent.trim(), url: a.href });
            });
        }

        // Доступные качества видео (пример, нужно уточнить по странице)
        // Предположим, что ссылки на видео есть в data-атрибутах или в скриптах
        // Для начала вернем пустой массив, позже добавим логику
        const qualities = [];

        return {
            title,
            publishTime,
            views,
            duration,
            description,
            categories,
            artists,
            tags,
            qualities
        };
    }

    // Создаем кнопку и добавляем обработчик
    const btn = createDownloadButton();
    btn.addEventListener('click', () => {
        const videoData = parseVideoData();
        if (!videoData) {
            alert('Не удалось получить данные видео.');
            return;
        }
        // TODO: Открыть UI выбора качества и отправки
        console.log('Данные видео:', videoData);
        alert('Парсинг видео завершен. В консоли подробности.');
    });

    // TODO: Добавить динамическое обновление при смене видео (MutationObserver или слушать изменения URL)
})();
