let currentUser = null;
let machineryList = [];
let selectedCategory = '';
let searchString = '';
let selectedMachine = null;

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    checkAuth();
    loadCatalog();
});

// Toast Notifications System
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const iconMap = {
        success: 'fa-circle-check',
        error: 'fa-circle-exclamation',
        info: 'fa-circle-info'
    };
    const icon = iconMap[type] || 'fa-circle-info';

    toast.innerHTML = `
        <i class="toast-icon fa-solid ${icon}"></i>
        <div class="toast-message">${message}</div>
        <button class="toast-close" onclick="this.parentElement.remove()"><i class="fa-solid fa-xmark"></i></button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOutToast 0.35s ease both';
        setTimeout(() => toast.remove(), 350);
    }, 4000);
}

// Light/Dark Theme Controller
function initTheme() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        toggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
        document.body.classList.remove('light-theme');
        toggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }

    toggleBtn.addEventListener('click', () => {
        if (document.body.classList.contains('light-theme')) {
            document.body.classList.remove('light-theme');
            toggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
            localStorage.setItem('theme', 'dark');
            showToast('Активирована темная тема', 'info');
        } else {
            document.body.classList.add('light-theme');
            toggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
            localStorage.setItem('theme', 'light');
            showToast('Активирована светлая тема', 'info');
        }
    });
}

// Check if user is logged in
async function checkAuth() {
    try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        currentUser = data.user;
        updateNavbar();
    } catch (err) {
        console.error('Error checking authentication state:', err);
    }
}

// Update navigation header based on login status
function updateNavbar() {
    const container = document.getElementById('auth-nav-container');
    if (!container) return;

    if (currentUser) {
        let adminBtn = '';
        if (currentUser.role === 'admin') {
            adminBtn = `<a href="admin.html" class="btn btn-secondary btn-sm"><i class="fa-solid fa-gauge-high"></i> Панель</a>`;
        }
        container.innerHTML = `
            ${adminBtn}
            <a href="profile.html" class="btn btn-secondary btn-sm"><i class="fa-solid fa-user"></i> ${currentUser.fullName.split(' ')[0]}</a>
            <button onclick="logout()" class="btn btn-danger btn-sm"><i class="fa-solid fa-right-from-bracket"></i></button>
        `;
    } else {
        container.innerHTML = `
            <a href="auth.html" class="btn btn-secondary btn-sm">Войти</a>
            <a href="auth.html" class="btn btn-primary btn-sm">Регистрация</a>
        `;
    }
}

// Logout handler
async function logout() {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        currentUser = null;
        updateNavbar();
        window.location.reload();
    } catch (err) {
        console.error('Logout error:', err);
    }
}

// Standard catalog mock data for preview mode
const DEFAULT_MACHINERY = [
    {
        id: 1,
        name: 'Гусеничный экскаватор JCB JS220',
        category: 'excavator',
        price: 18000,
        description: 'Мощный и надежный гусеничный экскаватор для выполнения земляных работ любой сложности. Объем ковша 1.2 м³, максимальная глубина копания до 6.5 м.',
        specs: JSON.stringify({
            'Вес': '22 тонны',
            'Мощность': '172 л.с.',
            'Объем ковша': '1.2 м³',
            'Глубина копания': '6.5 м'
        }),
        imageUrl: 'https://images.unsplash.com/photo-1579721528659-1e35fa848d7c?auto=format&fit=crop&w=800&q=80',
        status: 'available'
    },
    {
        id: 2,
        name: 'Самосвал КАМАЗ-6520',
        category: 'truck',
        price: 12000,
        description: 'Тяжелый самосвал грузоподъемностью 20 тонн. Идеально подходит для транспортировки сыпучих строительных материалов: песка, щебня, грунта.',
        specs: JSON.stringify({
            'Грузоподъемность': '20 тонн',
            'Объем кузова': '20 м³',
            'Колесная формула': '6х4',
            'Мощность': '400 л.с.'
        }),
        imageUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80',
        status: 'available'
    },
    {
        id: 3,
        name: 'Автокран Liebherr LTM 1050',
        category: 'crane',
        price: 25000,
        description: 'Мобильный телескопический кран повышенной проходимости. Максимальная грузоподъемность 50 тонн, вылет стрелы до 38 метров.',
        specs: JSON.stringify({
            'Грузоподъемность': '50 тонн',
            'Длина стрелы': '38 м',
            'Колесная база': '6х6х6',
            'Скорость передвижения': '80 км/ч'
        }),
        imageUrl: 'https://images.unsplash.com/photo-1542362567-b07eac79094d?auto=format&fit=crop&w=800&q=80',
        status: 'available'
    },
    {
        id: 4,
        name: 'Фронтальный погрузчик SDLG LG936L',
        category: 'loader',
        price: 11000,
        description: 'Универсальный колесный погрузчик грузоподъемностью 3 тонны. Отличное решение для погрузки строительных материалов, планировки территории и уборки снега.',
        specs: JSON.stringify({
            'Грузоподъемность': '3 тонны',
            'Объем ковша': '1.8 м³',
            'Высота выгрузки': '2.95 м',
            'Вес': '10.7 тонн'
        }),
        imageUrl: 'https://images.unsplash.com/photo-1605787020600-b9ebd5df1d07?auto=format&fit=crop&w=800&q=80',
        status: 'available'
    },
    {
        id: 5,
        name: 'Бульдозер Shantui SD16',
        category: 'bulldozer',
        price: 16000,
        description: 'Гусеничный бульдозер 160 л.с. для перемещения больших объемов грунта, планировки строительных площадок и дорожного строительства.',
        specs: JSON.stringify({
            'Вес': '17 тонн',
            'Мощность': '160 л.с.',
            'Ширина отвала': '3.4 м',
            'Призма волочения': '4.5 м³'
        }),
        imageUrl: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
        status: 'available'
    },
    {
        id: 6,
        name: 'Мини-погрузчик Bobcat S530',
        category: 'loader',
        price: 9000,
        description: 'Компактный и маневренный колесный мини-погрузчик для работы в стесненных городских условиях и внутри складских помещений.',
        specs: JSON.stringify({
            'Грузоподъемность': '870 кг',
            'Вес': '2.8 тонн',
            'Мощность': '49 л.с.',
            'Высота подъема': '3.0 м'
        }),
        imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
        status: 'available'
    }
];

// Load machinery catalog
async function loadCatalog() {
    try {
        const response = await fetch('/api/machinery');
        if (!response.ok) throw new Error('API response not ok');
        machineryList = await response.json();
    } catch (err) {
        console.info('Demonstration mode active: loading catalog preview data.');
        machineryList = DEFAULT_MACHINERY;
    }
    renderCatalog();
    initInteractiveCalc();
}

// Render dynamic machinery cards
function renderCatalog() {
    const grid = document.getElementById('machinery-grid');
    if (!grid) return;

    // Apply local search and category filter
    const filtered = machineryList.filter(item => {
        const matchesCategory = !selectedCategory || item.category === selectedCategory;
        const matchesSearch = !searchString || 
            item.name.toLowerCase().includes(searchString.toLowerCase()) || 
            item.description.toLowerCase().includes(searchString.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--c-text-2);padding:60px 0;font-size:0.95rem;">По вашему запросу техника не найдена.</p>';
        return;
    }

    grid.innerHTML = filtered.map(item => {
        // Parse specs JSON
        let specsHtml = '';
        try {
            const specs = JSON.parse(item.specs || '{}');
            specsHtml = Object.entries(specs).slice(0, 3).map(([key, val]) => `
                <li>
                    <span>${key}:</span>
                    <span>${val}</span>
                </li>
            `).join('');
        } catch (e) {
            specsHtml = '<li><span>Характеристики:</span><span>В описании</span></li>';
        }

        const categoryNames = {
            excavator: 'Экскаватор',
            truck: 'Самосвал',
            crane: 'Автокран',
            loader: 'Погрузчик',
            tractor: 'Трактор'
        };

        const displayCategory = categoryNames[item.category] || 'Спецтехника';

        return `
            <div class="machine-card">
                <div class="machine-img">
                    <img src="${item.imageUrl}" alt="${item.name}" loading="lazy">
                    <span class="machine-tag">${displayCategory}</span>
                </div>
                <div class="machine-info">
                    <h3>${item.name}</h3>
                    <p class="machine-desc">${item.description || 'Описание отсутствует.'}</p>
                    <ul class="machine-specs">
                        ${specsHtml}
                    </ul>
                    <div class="card-footer">
                        <div class="price-label">
                            <span>Цена аренды</span>
                            <span class="price-val">${item.price.toLocaleString('ru-RU')} ₽ <small>/ сут</small></span>
                        </div>
                        <button onclick="openBookingModal(${item.id})" class="btn btn-primary btn-sm">
                            Арендовать <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Category filter trigger
function filterCategory(category) {
    selectedCategory = category;
    
    // Update pills styling
    const pills = document.querySelectorAll('#category-pills .pill');
    pills.forEach(pill => {
        pill.classList.remove('active');
    });

    const indexMap = {
        '': 0,
        'excavator': 1,
        'truck': 2,
        'crane': 3,
        'loader': 4,
        'tractor': 5
    };
    
    const activeIndex = indexMap[category] !== undefined ? indexMap[category] : 0;
    if (pills[activeIndex]) {
        pills[activeIndex].classList.add('active');
    }

    renderCatalog();
}

// Search field trigger
function handleSearch(event) {
    searchString = event.target.value;
    renderCatalog();
}

// Booking Modal Controls
function openBookingModal(machineId) {
    if (!currentUser) {
        showToast('Для заказа аренды необходимо войти в аккаунт', 'error');
        setTimeout(() => {
            window.location.href = 'auth.html';
        }, 1200);
        return;
    }

    selectedMachine = machineryList.find(m => m.id === machineId);
    if (!selectedMachine) return;

    // Reset forms
    document.getElementById('booking-form').reset();
    document.getElementById('booking-error').style.display = 'none';
    document.getElementById('booking-success').style.display = 'none';

    document.getElementById('booking-machine-id').value = selectedMachine.id;
    document.getElementById('booking-modal-title').innerText = `Заявка на аренду: ${selectedMachine.name}`;
    document.getElementById('booking-price-per-day').innerText = `${selectedMachine.price.toLocaleString('ru-RU')} ₽`;

    // Set minimal date limit (today)
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('booking-start-date').min = today;
    document.getElementById('booking-end-date').min = today;

    // Show Overlay
    document.getElementById('booking-modal').classList.add('active');
    calculateBookingPrice();
}

function closeBookingModal() {
    document.getElementById('booking-modal').classList.remove('active');
    selectedMachine = null;
}

// Dynamic Price calculations
function calculateBookingPrice() {
    if (!selectedMachine) return;

    const startDateStr = document.getElementById('booking-start-date').value;
    const endDateStr = document.getElementById('booking-end-date').value;
    const daysLabel = document.getElementById('booking-days');
    const totalPriceLabel = document.getElementById('booking-total-price');

    if (!startDateStr || !endDateStr) {
        daysLabel.innerText = '0';
        totalPriceLabel.innerText = '0 ₽';
        return;
    }

    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    if (end < start) {
        daysLabel.innerText = '0';
        totalPriceLabel.innerText = '0 ₽';
        return;
    }

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; // min 1 day

    daysLabel.innerText = diffDays;
    const total = selectedMachine.price * diffDays;
    totalPriceLabel.innerText = `${total.toLocaleString('ru-RU')} ₽`;
}

// Submit Booking form
async function submitBooking(event) {
    event.preventDefault();

    const machineId = document.getElementById('booking-machine-id').value;
    const startDate = document.getElementById('booking-start-date').value;
    const endDate = document.getElementById('booking-end-date').value;
    const comment = document.getElementById('booking-comment').value;

    const errorDiv = document.getElementById('booking-error');
    const successDiv = document.getElementById('booking-success');
    const submitBtn = document.getElementById('booking-submit-btn');

    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';

    if (new Date(endDate) < new Date(startDate)) {
        errorDiv.innerText = 'Дата окончания не может быть раньше даты начала аренды';
        errorDiv.style.display = 'block';
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Отправка... <i class="fa-solid fa-spinner fa-spin"></i>';

    try {
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                machineryId: parseInt(machineId),
                startDate,
                endDate,
                comment
            })
        });

        const data = await response.json();

        if (!response.ok) {
            errorDiv.innerText = data.error || 'Произошла ошибка при создании заказа';
            errorDiv.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Оформить заказ <i class="fa-solid fa-check"></i>';
            return;
        }

        successDiv.innerText = data.message;
        successDiv.style.display = 'block';
        
        setTimeout(() => {
            closeBookingModal();
            window.location.href = 'profile.html';
        }, 2000);

    } catch (err) {
        console.error('Booking submission error:', err);
        errorDiv.innerText = 'Ошибка подключения к серверу. Пожалуйста, попробуйте позже.';
        errorDiv.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Оформить заказ <i class="fa-solid fa-check"></i>';
    }
}

// Initialize Quote Calculator Dropdown
function initInteractiveCalc() {
    const select = document.getElementById('calc-machine');
    if (!select) return;

    select.innerHTML = '<option value="" disabled selected>Выберите модель...</option>' + 
        machineryList.map(m => `<option value="${m.id}">${m.name} (${m.price.toLocaleString('ru-RU')} ₽/сут)</option>`).join('');

    // Pre-fill dates (today & tomorrow)
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const startInput = document.getElementById('calc-start');
    const endInput = document.getElementById('calc-end');

    if (startInput && endInput) {
        startInput.value = today.toISOString().split('T')[0];
        startInput.min = today.toISOString().split('T')[0];
        endInput.value = tomorrow.toISOString().split('T')[0];
        endInput.min = today.toISOString().split('T')[0];
    }
}

// Update Quote Calculator Output
function updateInteractiveCalc() {
    const select = document.getElementById('calc-machine');
    if (!select) return;

    const machineId = parseInt(select.value);
    const startStr = document.getElementById('calc-start').value;
    const endStr = document.getElementById('calc-end').value;
    const optDriver = document.getElementById('calc-opt-driver').checked;
    const optFuel = document.getElementById('calc-opt-fuel').checked;

    const nameLabel = document.getElementById('calc-result-name');
    const catLabel = document.getElementById('calc-result-category');
    const rateLabel = document.getElementById('calc-result-rate');
    const daysLabel = document.getElementById('calc-result-days');
    const addonsLabel = document.getElementById('calc-result-addons');
    const totalLabel = document.getElementById('calc-result-total');

    const machine = machineryList.find(m => m.id === machineId);
    if (!machine) return;

    const categoryNames = {
        excavator: 'Гусеничные / Колесные экскаваторы',
        truck: 'Самосвалы КамАЗ',
        crane: 'Автокраны повышенной грузоподъемности',
        loader: 'Погрузчики',
        tractor: 'Бульдозеры и тракторы'
    };

    nameLabel.innerText = machine.name;
    catLabel.innerText = categoryNames[machine.category] || 'Спецтехника';
    rateLabel.innerText = `${machine.price.toLocaleString('ru-RU')} ₽`;

    if (!startStr || !endStr) {
        daysLabel.innerText = 'Укажите даты';
        addonsLabel.innerText = '—';
        totalLabel.innerText = '0 ₽';
        return;
    }

    const start = new Date(startStr);
    const end = new Date(endStr);
    if (end < start) {
        daysLabel.innerText = 'Неверный период';
        addonsLabel.innerText = '—';
        totalLabel.innerText = '0 ₽';
        return;
    }

    const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) || 1;
    daysLabel.innerText = `${diffDays} сут.`;

    let dailyRate = machine.price;
    let addonsText = [];

    if (optDriver) {
        addonsText.push('Машинист');
    }
    if (optFuel) {
        dailyRate = dailyRate * 1.2;
        addonsText.push('+ ГСМ (+20%)');
    }

    addonsLabel.innerText = addonsText.length > 0 ? addonsText.join(', ') : 'Без опций';

    const total = Math.round(dailyRate * diffDays);
    totalLabel.innerText = `${total.toLocaleString('ru-RU')} ₽`;
}

// Redirect calculation selection to modal booking
function orderFromCalculator() {
    const select = document.getElementById('calc-machine');
    if (!select || !select.value) {
        showToast('Пожалуйста, выберите технику в калькуляторе', 'error');
        return;
    }

    const machineId = parseInt(select.value);
    const startStr = document.getElementById('calc-start').value;
    const endStr = document.getElementById('calc-end').value;
    const optFuel = document.getElementById('calc-opt-fuel').checked;

    openBookingModal(machineId);

    // Set dates in modal
    const modalStart = document.getElementById('booking-start-date');
    const modalEnd = document.getElementById('booking-end-date');
    const modalComment = document.getElementById('booking-comment');

    if (modalStart && modalEnd) {
        modalStart.value = startStr;
        modalEnd.value = endStr;
        calculateBookingPrice();
    }

    if (modalComment && optFuel) {
        modalComment.value = 'Заказ с учетом ГСМ (расчет по калькулятору).';
    }
}

