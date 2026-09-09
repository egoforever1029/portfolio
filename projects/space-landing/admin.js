/**
 * Логика управления админ-панели STELLARIS
 */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. Инициализация и системное время
    // ==========================================
    const systemTimeEl = document.getElementById('system-time');
    
    const updateTime = () => {
        const now = new Date();
        const hrs = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        const secs = String(now.getSeconds()).padStart(2, '0');
        if (systemTimeEl) {
            systemTimeEl.textContent = `${hrs}:${mins}:${secs}`;
        }
    };
    setInterval(updateTime, 1000);
    updateTime();

    // ==========================================
    // 2. Дефолтные данные для CMS
    // ==========================================
    const defaultHero = {
        title: "КОСМИЧЕСКАЯ ОДИССЕЯ",
        subtitle: "Интерактивное погружение в неизведанные глубины космоса. Откройте для себя тайны планет, гравитационные аномалии и вехи освоения Вселенной."
    };

    const defaultPlanets = {
        mars: {
            title: "Марс",
            desc: "Четвертая планета от Солнца, названная в честь древнеримского бога войны. Также известна как Красная планета из-за высокого содержания оксида железа на ее поверхности. Здесь находятся гигантские вулканы и каньоны.",
            gravity: "3.71 м/с²",
            distance: "227.9 млн км",
            temp: "-63 °C"
        },
        jupiter: {
            title: "Юпитер",
            desc: "Крупнейшая планета Солнечной системы, газовый гигант с массой, более чем в два раза превышающей массу всех остальных планет вместе взятых. Знаменит своим Большим Красным Пятном — вихрем, бушующим уже несколько веков, и десятками спутников.",
            gravity: "24.79 м/с²",
            distance: "778.5 млн км",
            temp: "-108 °C"
        },
        saturn: {
            title: "Сатурн",
            desc: "Второй по величине газовый гигант, знаменитый своей великолепной и сложной системой ледяных и пылевых колец. У Сатурна наименьшая плотность среди всех планет — он мог бы плавать на воде. Имеет развитую спутниковую систему во главе с ледяным Титаном.",
            gravity: "10.44 м/с²",
            distance: "1.43 млрд км",
            temp: "-139 °C"
        }
    };

    // Загрузка или сохранение дефолтных настроек
    const getHeroData = () => {
        const hero = localStorage.getItem('cms_hero');
        return hero ? JSON.parse(hero) : defaultHero;
    };

    const getPlanetsData = () => {
        const planets = localStorage.getItem('cms_planets');
        return planets ? JSON.parse(planets) : defaultPlanets;
    };

    const getTransmissions = () => {
        const t = localStorage.getItem('transmissions');
        return t ? JSON.parse(t) : [];
    };

    const getVisits = () => {
        return parseInt(localStorage.getItem('visits') || '0');
    };

    // ==========================================
    // 3. Логика вкладок админ-панели
    // ==========================================
    const menuItems = document.querySelectorAll('.menu-item');
    const tabContents = document.querySelectorAll('.tab-content');

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetTab = item.getAttribute('data-tab');

            menuItems.forEach(mi => mi.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));

            item.classList.add('active');
            document.getElementById(targetTab).classList.add('active');

            // При переключении вкладок перерендериваем данные
            if (targetTab === 'dashboard') {
                renderDashboard();
            } else if (targetTab === 'signals') {
                renderSignals();
            }
        });
    });

    // ==========================================
    // 4. Отрисовка Дашборда (Статистика)
    // ==========================================
    const renderDashboard = () => {
        const visits = getVisits();
        const transmissions = getTransmissions();

        document.getElementById('stat-visits').textContent = visits;
        document.getElementById('stat-signals').textContent = transmissions.length;
        document.getElementById('signals-badge').textContent = transmissions.length;

        // Расчет заполнения хранилища (localStorage лимит ~5MB = 5242880 символов)
        const storageSize = JSON.stringify(localStorage).length;
        const storageLimit = 5 * 1024 * 1024;
        const usagePercent = Math.min(100, Math.max(1, Math.round((storageSize / storageLimit) * 100)));
        
        const storagePercentageEl = document.getElementById('storage-percentage');
        const storageFillBarEl = document.getElementById('storage-fill-bar');
        
        if (storagePercentageEl) storagePercentageEl.textContent = `${usagePercent}%`;
        if (storageFillBarEl) storageFillBarEl.style.width = `${usagePercent}%`;

        // Отрисовка графика секторов
        const sectorCounts = { earth: 0, mars: 0, belt: 0, outer: 0 };
        transmissions.forEach(t => {
            if (sectorCounts[t.sector] !== undefined) {
                sectorCounts[t.sector]++;
            }
        });

        const sectorNames = {
            earth: "Земля",
            mars: "Марс",
            belt: "Пояс",
            outer: "Космос"
        };

        const maxCount = Math.max(1, ...Object.values(sectorCounts));
        const chartContainer = document.getElementById('sectors-chart');
        
        if (chartContainer) {
            chartContainer.innerHTML = '';
            Object.keys(sectorCounts).forEach(key => {
                const count = sectorCounts[key];
                const heightPercent = Math.round((count / maxCount) * 100);
                
                const item = document.createElement('div');
                item.className = 'chart-bar-item';
                item.innerHTML = `
                    <span class="bar-val">${count}</span>
                    <div class="bar-wrapper">
                        <div class="bar-fill" style="height: ${heightPercent}%"></div>
                    </div>
                    <span class="bar-label">${sectorNames[key]}</span>
                `;
                chartContainer.appendChild(item);
            });
        }
    };

    // ==========================================
    // 5. Отрисовка Списка Сигналов
    // ==========================================
    const renderSignals = () => {
        const transmissions = getTransmissions();
        const tableBody = document.getElementById('signals-table-body');
        const noSignalsMsg = document.getElementById('no-signals-msg');

        if (!tableBody) return;
        tableBody.innerHTML = '';

        const sectorTitles = {
            earth: "Орбита Земли",
            mars: "Купол Марса",
            belt: "Пояс Астероидов",
            outer: "Внешние системы"
        };

        if (transmissions.length === 0) {
            if (noSignalsMsg) noSignalsMsg.style.display = 'flex';
            document.getElementById('signals-badge').textContent = '0';
            return;
        }

        if (noSignalsMsg) noSignalsMsg.style.display = 'none';
        document.getElementById('signals-badge').textContent = transmissions.length;

        // Рендерим строки таблицы (последние сообщения вверху)
        transmissions.slice().reverse().forEach((trans, index) => {
            // Восстанавливаем реальный индекс в исходном массиве
            const originalIndex = transmissions.length - 1 - index;
            
            const tr = document.createElement('tr');
            
            const date = new Date(trans.timestamp);
            const formattedTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;

            tr.innerHTML = `
                <td><strong style="color: var(--color-cyan)">${formattedTime}</strong></td>
                <td>${escapeHTML(trans.callsign)}</td>
                <td><a href="mailto:${escapeHTML(trans.email)}" style="color: var(--color-text-muted); text-decoration: none;">${escapeHTML(trans.email)}</a></td>
                <td><span class="badge" style="background: rgba(0, 242, 254, 0.1); border: 1px solid rgba(0, 242, 254, 0.2); color: var(--color-cyan); margin:0;">${sectorTitles[trans.sector] || trans.sector}</span></td>
                <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHTML(trans.message)}</td>
                <td>
                    <button class="btn-delete-row" data-index="${originalIndex}" title="Удалить сигнал">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(tr);
        });

        // Слушатели на удаление строк
        document.querySelectorAll('.btn-delete-row').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetIdx = parseInt(btn.getAttribute('data-index'));
                deleteTransmission(targetIdx);
            });
        });
    };

    const deleteTransmission = (index) => {
        const transmissions = getTransmissions();
        transmissions.splice(index, 1);
        localStorage.setItem('transmissions', JSON.stringify(transmissions));
        renderSignals();
        renderDashboard();
    };

    // Очистить все сигналы
    const btnClearAll = document.getElementById('clear-all-signals');
    if (btnClearAll) {
        btnClearAll.addEventListener('click', () => {
            if (confirm("Вы уверены, что хотите полностью очистить журнал входящих сигналов?")) {
                localStorage.setItem('transmissions', JSON.stringify([]));
                renderSignals();
                renderDashboard();
            }
        });
    }

    // Вспомогательная функция защиты от XSS
    const escapeHTML = (str) => {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    };


    // ==========================================
    // 6. Управление Контентом (CMS)
    // ==========================================
    const heroForm = document.getElementById('cms-hero-form');
    const planetForm = document.getElementById('cms-planet-form');

    const heroTitleInput = document.getElementById('edit-hero-title');
    const heroSubtitleInput = document.getElementById('edit-hero-subtitle');

    const planetDescInput = document.getElementById('edit-planet-desc');
    const planetGravityInput = document.getElementById('edit-planet-gravity');
    const planetDistanceInput = document.getElementById('edit-planet-distance');
    const planetTempInput = document.getElementById('edit-planet-temp');

    let activePlanetSel = 'mars';

    // Инициализация формы Главного экрана
    const initCMSForms = () => {
        const hero = getHeroData();
        if (heroTitleInput) heroTitleInput.value = hero.title;
        if (heroSubtitleInput) heroSubtitleInput.value = hero.subtitle;

        loadPlanetFormFields();
    };

    // Загрузка полей для выбранной планеты
    const loadPlanetFormFields = () => {
        const planets = getPlanetsData();
        const planet = planets[activePlanetSel];

        if (planet) {
            if (planetDescInput) planetDescInput.value = planet.desc;
            if (planetGravityInput) planetGravityInput.value = planet.gravity;
            if (planetDistanceInput) planetDistanceInput.value = planet.distance;
            if (planetTempInput) planetTempInput.value = planet.temp;
        }
    };

    // Слушатели для вкладок планет в CMS
    const planetSelBtns = document.querySelectorAll('.planet-sel-btn');
    planetSelBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            planetSelBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activePlanetSel = btn.getAttribute('data-sel');
            loadPlanetFormFields();
        });
    });

    // Сохранение Главного экрана
    if (heroForm) {
        heroForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const updatedHero = {
                title: heroTitleInput.value,
                subtitle: heroSubtitleInput.value
            };
            localStorage.setItem('cms_hero', JSON.stringify(updatedHero));
            showSuccessNotification("Текст главного экрана успешно обновлен!");
        });
    }

    // Сохранение Планеты
    if (planetForm) {
        planetForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const planets = getPlanetsData();
            
            if (planets[activePlanetSel]) {
                planets[activePlanetSel].desc = planetDescInput.value;
                planets[activePlanetSel].gravity = planetGravityInput.value;
                planets[activePlanetSel].distance = planetDistanceInput.value;
                planets[activePlanetSel].temp = planetTempInput.value;

                localStorage.setItem('cms_planets', JSON.stringify(planets));
                showSuccessNotification(`Характеристики планеты ${planets[activePlanetSel].title} успешно сохранены!`);
            }
        });
    }

    // Функция нотификации об успешном сохранении
    const showSuccessNotification = (msg) => {
        const toast = document.createElement('div');
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.background = 'rgba(0, 255, 102, 0.15)';
        toast.style.color = '#fff';
        toast.style.border = '1px solid var(--color-green)';
        toast.style.padding = '12px 24px';
        toast.style.borderRadius = '8px';
        toast.style.fontFamily = 'var(--font-headers)';
        toast.style.fontSize = '0.8rem';
        toast.style.boxShadow = '0 0 15px rgba(0, 255, 102, 0.2)';
        toast.style.zIndex = '99999';
        toast.style.display = 'flex';
        toast.style.alignItems = 'center';
        toast.style.gap = '10px';
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.4s ease';

        toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--color-green)"></i> ${msg}`;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '1';
        }, 50);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 400);
        }, 3000);
    };

    // Сброс к заводским настройкам
    const btnReset = document.getElementById('btn-factory-reset');
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            if (confirm("Внимание! Вы собираетесь сбросить все изменения контента сайта и очистить все принятые сообщения. Продолжить?")) {
                localStorage.removeItem('cms_hero');
                localStorage.removeItem('cms_planets');
                localStorage.removeItem('transmissions');
                localStorage.removeItem('visits');
                alert("Сброс успешно выполнен.");
                location.reload();
            }
        });
    }

    // Первоначальный запуск отрисовки
    renderDashboard();
    initCMSForms();

});
