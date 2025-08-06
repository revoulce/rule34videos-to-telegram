(() => {
    // --- Стили для модального окна ---
    const modalStyles = `
    #r34-modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 10001;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    #r34-modal {
      background: #fff;
      border-radius: 8px;
      width: 320px;
      max-width: 90%;
      padding: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      font-family: Arial, sans-serif;
      color: #333;
    }
    #r34-modal h2 {
      margin-top: 0;
      font-size: 18px;
      margin-bottom: 15px;
    }
    #r34-modal label {
      display: block;
      margin-bottom: 10px;
      font-weight: bold;
    }
    #r34-modal select, #r34-modal input[type="checkbox"] {
      margin-top: 5px;
      margin-bottom: 15px;
      width: 100%;
      padding: 6px;
      font-size: 14px;
    }
    #r34-modal .checkbox-label {
      font-weight: normal;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    #r34-modal button {
      background-color: #d1404a;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      width: 100%;
    }
    #r34-modal button:disabled {
      background-color: #aaa;
      cursor: not-allowed;
    }
    #r34-modal #r34-status {
      margin-top: 10px;
      font-size: 14px;
      min-height: 20px;
      color: #555;
    }
    #r34-modal-close {
      position: absolute;
      top: 10px;
      right: 15px;
      font-size: 18px;
      font-weight: bold;
      color: #999;
      cursor: pointer;
    }
  `;

    // --- Вставка стилей ---
    function injectStyles() {
        if (document.getElementById('r34-modal-styles')) return;
        const style = document.createElement('style');
        style.id = 'r34-modal-styles';
        style.textContent = modalStyles;
        document.head.appendChild(style);
    }

    // --- Создание модального окна ---
    function createModal(videoData) {
        // Если уже есть, не создаём заново
        if (document.getElementById('r34-modal-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'r34-modal-overlay';

        const modal = document.createElement('div');
        modal.id = 'r34-modal';
        modal.style.position = 'relative';

        // Кнопка закрытия
        const closeBtn = document.createElement('span');
        closeBtn.id = 'r34-modal-close';
        closeBtn.textContent = '×';
        closeBtn.title = 'Закрыть';
        closeBtn.onclick = () => {
            overlay.remove();
        };
        modal.appendChild(closeBtn);

        // Заголовок
        const title = document.createElement('h2');
        title.textContent = 'Отправить видео в Telegram';
        modal.appendChild(title);

        // Выбор качества (пока заглушка)
        const qualityLabel = document.createElement('label');
        qualityLabel.textContent = 'Выберите качество:';
        modal.appendChild(qualityLabel);

        const qualitySelect = document.createElement('select');
        qualitySelect.id = 'r34-quality-select';

        // Если нет доступных качеств, добавим дефолт
        if (!videoData.qualities || videoData.qualities.length === 0) {
            const option = document.createElement('option');
            option.value = 'default';
            option.textContent = 'Стандартное качество';
            qualitySelect.appendChild(option);
        } else {
            videoData.qualities.forEach(q => {
                const option = document.createElement('option');
                option.value = q.url;
                option.textContent = `${q.label} (${q.size || 'неизвестно'})`;
                qualitySelect.appendChild(option);
            });
        }
        modal.appendChild(qualitySelect);

        // Чекбокс для включения названия в подпись
        const captionLabel = document.createElement('label');
        captionLabel.className = 'checkbox-label';
        const captionCheckbox = document.createElement('input');
        captionCheckbox.type = 'checkbox';
        captionCheckbox.id = 'r34-caption-checkbox';
        captionCheckbox.checked = true;
        captionLabel.appendChild(captionCheckbox);
        captionLabel.appendChild(document.createTextNode('Включить название в подпись'));
        modal.appendChild(captionLabel);

        // Кнопка отправки
        const sendBtn = document.createElement('button');
        sendBtn.id = 'r34-send-btn';
        sendBtn.textContent = 'Отправить';
        modal.appendChild(sendBtn);

        // Статус
        const statusDiv = document.createElement('div');
        statusDiv.id = 'r34-status';
        modal.appendChild(statusDiv);

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Обработчик кнопки отправки
        sendBtn.addEventListener('click', () => {
            sendBtn.disabled = true;
            statusDiv.textContent = 'Отправка...';

            const selectedQualityUrl = qualitySelect.value;
            const includeTitle = captionCheckbox.checked;

            // Формируем данные для отправки на сервер
            const payload = {
                videoUrl: selectedQualityUrl,
                title: includeTitle ? videoData.title : '',
                description: videoData.description,
                tags: videoData.tags.map(t => t.name),
                artists: videoData.artists.map(a => a.name),
                categories: videoData.categories.map(c => c.name)
            };

            // Отправляем на сервер (пример URL, заменить на ваш)
            fetch('http://localhost:3000/api/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        statusDiv.textContent = 'Видео успешно отправлено!';
                    } else {
                        statusDiv.textContent = 'Ошибка: ' + (data.message || 'Неизвестная ошибка');
                        sendBtn.disabled = false;
                    }
                })
                .catch(err => {
                    statusDiv.textContent = 'Ошибка сети: ' + err.message;
                    sendBtn.disabled = false;
                });
        });
    }

    // --- Создание кнопки ---
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

    // --- Парсинг данных видео (упрощённый, без качеств) ---
    function parseVideoData() {
        const title = document.querySelector('h1.title_video')?.textContent.trim() || '';
        const infoBlock = document.getElementById('tab_video_info');
        if (!infoBlock) return null;

        let description = '';
        const descElem = infoBlock.querySelector('.row .label em');
        if (descElem) description = descElem.textContent.trim();

        const categories = [];
        const artists = [];
        const tags = [];

        const categoryElems = Array.from(infoBlock.querySelectorAll('.col')).find(col => {
            const label = col.querySelector('.label');
            return label && label.textContent.includes('Categories');
        });
        if (categoryElems) {
            categoryElems.querySelectorAll('a.item.btn_link').forEach(a => {
                categories.push({ name: a.textContent.trim(), url: a.href });
            });
        }

        const artistElems = Array.from(infoBlock.querySelectorAll('.col')).find(col => {
            const label = col.querySelector('.label');
            return label && label.textContent.includes('Artist');
        });
        if (artistElems) {
            artistElems.querySelectorAll('a.item.btn_link').forEach(a => {
                artists.push({ name: a.textContent.trim(), url: a.href });
            });
        }

        const tagRow = Array.from(infoBlock.querySelectorAll('.row.row_spacer')).find(row => {
            const label = row.querySelector('.label');
            return label && label.textContent.includes('Tags');
        });
        if (tagRow) {
            tagRow.querySelectorAll('a.tag_item').forEach(a => {
                tags.push({ name: a.textContent.trim(), url: a.href });
            });
        }

        // Пока качества пусты, позже добавим логику
        const qualities = [
            { label: 'Стандартное качество', url: window.location.href } // заглушка
        ];

        return {
            title,
            description,
            categories,
            artists,
            tags,
            qualities
        };
    }

    // --- Основной код ---
    injectStyles();
    const btn = createDownloadButton();
    btn.addEventListener('click', () => {
        const videoData = parseVideoData();
        if (!videoData) {
            alert('Не удалось получить данные видео.');
            return;
        }
        createModal(videoData);
    });

    // TODO: добавить динамическое обновление при смене видео (MutationObserver или слушать изменения URL)
})();
