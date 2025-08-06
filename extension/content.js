(() => {
    // Вставка стилей и создание кнопки — как в предыдущем коде
    const styles = `
    /* Стили кнопки и модального окна (копируйте из предыдущего ответа) */
    #r34-download-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 10000;
      background-color: #d1404a;
      border: none;
      border-radius: 50%;
      width: 56px;
      height: 56px;
      cursor: pointer;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.3s ease;
    }
    #r34-download-btn:hover {
      background-color: #b8323f;
    }
    #r34-download-btn svg {
      width: 24px;
      height: 24px;
      fill: white;
    }
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
      width: 360px;
      max-width: 90%;
      padding: 20px 25px 25px 25px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.3);
      font-family: Arial, sans-serif;
      color: #333;
      position: relative;
    }
    #r34-modal h2 {
      margin-top: 0;
      font-size: 20px;
      margin-bottom: 20px;
      font-weight: 600;
    }
    #r34-modal label {
      display: block;
      margin-bottom: 10px;
      font-weight: 600;
      font-size: 14px;
    }
    #r34-modal select, #r34-modal input[type="checkbox"] {
      margin-top: 5px;
      margin-bottom: 20px;
      width: 100%;
      padding: 8px 10px;
      font-size: 14px;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-sizing: border-box;
      transition: border-color 0.2s ease;
    }
    #r34-modal select:focus, #r34-modal input[type="checkbox"]:focus {
      outline: none;
      border-color: #d1404a;
      box-shadow: 0 0 5px rgba(209,64,74,0.5);
    }
    #r34-modal .checkbox-label {
      font-weight: normal;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      user-select: none;
    }
    #r34-modal button {
      background-color: #d1404a;
      color: white;
      border: none;
      padding: 12px 0;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      width: 100%;
      transition: background-color 0.3s ease;
    }
    #r34-modal button:disabled {
      background-color: #aaa;
      cursor: not-allowed;
    }
    #r34-modal #r34-status {
      margin-top: 12px;
      font-size: 14px;
      min-height: 22px;
      color: #555;
      word-break: break-word;
    }
    #r34-modal-close {
      position: absolute;
      top: 12px;
      right: 15px;
      font-size: 24px;
      font-weight: 700;
      color: #999;
      cursor: pointer;
      user-select: none;
      transition: color 0.2s ease;
    }
    #r34-modal-close:hover {
      color: #d1404a;
    }
  `;

    function injectStyles() {
        if (document.getElementById('r34-extension-styles')) return;
        const style = document.createElement('style');
        style.id = 'r34-extension-styles';
        style.textContent = styles;
        document.head.appendChild(style);
    }

    function createDownloadButton() {
        removeDownloadButton(); // Удаляем старую кнопку, если есть

        const btn = document.createElement('button');
        btn.id = 'r34-download-btn';
        btn.title = 'Скачать и отправить в Telegram';

        btn.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M5 20h14v-2H5v2zm7-18L5.33 9h3.67v6h6v-6h3.67L12 2z"/>
      </svg>
    `;

        btn.addEventListener('click', () => {
            const videoData = parseVideoData();
            if (!videoData) {
                alert('Не удалось получить данные видео.');
                return;
            }
            createModal(videoData);
        });

        document.body.appendChild(btn);
    }

    function removeDownloadButton() {
        const oldBtn = document.getElementById('r34-download-btn');
        if (oldBtn) oldBtn.remove();
    }

    function parseVideoData() {
        const title = document.querySelector('h1.title_video')?.textContent.trim() || '';
        const infoBlock = document.getElementById('tab_video_info');
        if (!infoBlock) return null;

        let publishTime = '';
        let views = '';
        let duration = '';
        let description = '';
        const categories = [];
        const artists = [];
        const tags = [];
        const qualities = [];

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

        const descElem = infoBlock.querySelector('.row .label em');
        if (descElem) description = descElem.textContent.trim();

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

        const wrapBlocks = document.querySelectorAll('div.wrap');
        wrapBlocks.forEach(wrap => {
            const labelDiv = wrap.querySelector('div.label');
            if (labelDiv && labelDiv.textContent.trim() === 'Download') {
                const links = wrap.querySelectorAll('a');
                links.forEach(link => {
                    const url = link.href;
                    const label = link.textContent.trim();
                    if (url && label) {
                        qualities.push({ label, url });
                    }
                });
            }
        });

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

    function createModal(videoData) {
        if (document.getElementById('r34-modal-overlay')) return;

        injectStyles();

        const overlay = document.createElement('div');
        overlay.id = 'r34-modal-overlay';

        const modal = document.createElement('div');
        modal.id = 'r34-modal';

        const closeBtn = document.createElement('span');
        closeBtn.id = 'r34-modal-close';
        closeBtn.textContent = '×';
        closeBtn.title = 'Закрыть';
        closeBtn.onclick = () => overlay.remove();
        modal.appendChild(closeBtn);

        const title = document.createElement('h2');
        title.textContent = 'Отправить видео в Telegram';
        modal.appendChild(title);

        const qualityLabel = document.createElement('label');
        qualityLabel.textContent = 'Выберите качество:';
        modal.appendChild(qualityLabel);

        const qualitySelect = document.createElement('select');
        qualitySelect.id = 'r34-quality-select';

        if (videoData.qualities.length === 0) {
            const option = document.createElement('option');
            option.value = window.location.href;
            option.textContent = 'Стандартное качество';
            qualitySelect.appendChild(option);
        } else {
            videoData.qualities.forEach(q => {
                const option = document.createElement('option');
                option.value = q.url;
                option.textContent = q.label;
                qualitySelect.appendChild(option);
            });
        }
        modal.appendChild(qualitySelect);

        const captionLabel = document.createElement('label');
        captionLabel.className = 'checkbox-label';
        const captionCheckbox = document.createElement('input');
        captionCheckbox.type = 'checkbox';
        captionCheckbox.id = 'r34-caption-checkbox';
        captionCheckbox.checked = true;
        captionLabel.appendChild(captionCheckbox);
        captionLabel.appendChild(document.createTextNode('Включить название в подпись'));
        modal.appendChild(captionLabel);

        const sendBtn = document.createElement('button');
        sendBtn.id = 'r34-send-btn';
        sendBtn.textContent = 'Отправить';
        modal.appendChild(sendBtn);

        const statusDiv = document.createElement('div');
        statusDiv.id = 'r34-status';
        modal.appendChild(statusDiv);

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        sendBtn.addEventListener('click', () => {
            sendBtn.disabled = true;
            statusDiv.textContent = 'Отправка...';

            const selectedQualityUrl = qualitySelect.value;
            const includeTitle = captionCheckbox.checked;

            const payload = {
                videoUrl: selectedQualityUrl,
                title: includeTitle ? videoData.title : '',
                description: videoData.description,
                tags: videoData.tags.map(t => t.name),
                artists: videoData.artists.map(a => a.name),
                categories: videoData.categories.map(c => c.name)
            };

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

    // Отслеживаем изменения URL (history API)
    function onUrlChange(callback) {
        let lastUrl = location.href;
        new MutationObserver(() => {
            const currentUrl = location.href;
            if (currentUrl !== lastUrl) {
                lastUrl = currentUrl;
                callback(currentUrl);
            }
        }).observe(document, { subtree: true, childList: true });
    }

    // Инициализация кнопки и логика обновления
    function init() {
        injectStyles();
        createDownloadButton();
    }

    // При загрузке страницы
    init();

    // При изменении URL — обновляем кнопку (удаляем и создаём заново)
    onUrlChange(() => {
        removeDownloadButton();
        createDownloadButton();
    });
})();
