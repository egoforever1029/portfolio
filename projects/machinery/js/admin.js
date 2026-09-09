let currentUser = null;
let bookingsList = [];
let machineryList = [];
let currentAdminView = 'bookings'; // 'bookings' or 'catalog'
let editMachineId = null;

document.addEventListener('DOMContentLoaded', () => {
    initAdmin();
});

async function initAdmin() {
    try {
        const meResponse = await fetch('/api/auth/me');
        const meData = await meResponse.json();
        
        if (!meData.user) {
            window.location.href = 'auth.html';
            return;
        }
        
        if (meData.user.role !== 'admin') {
            alert('У вас нет прав для доступа к панели администратора.');
            window.location.href = 'profile.html';
            return;
        }

        currentUser = meData.user;
        document.getElementById('admin-fullname').innerText = currentUser.fullName;

        loadStats();
        loadBookings();
        loadCatalog();
    } catch (err) {
        console.error('Admin panel initialization failed:', err);
        window.location.href = 'auth.html';
    }
}

// Load statistics
async function loadStats() {
    try {
        const response = await fetch('/api/admin/stats');
        const stats = await response.json();

        document.getElementById('admin-stat-revenue').innerText = `${stats.totalRevenue.toLocaleString('ru-RU')} ₽`;
        document.getElementById('admin-stat-active').innerText = stats.activeRentals;
        document.getElementById('admin-stat-pending').innerText = stats.pendingRentals;
        document.getElementById('admin-stat-machines').innerText = stats.machinesCount;
        document.getElementById('admin-stat-users').innerText = stats.usersCount;
    } catch (err) {
        console.error('Error loading admin statistics:', err);
    }
}

// Switch panels in sidebar
function switchAdminPanel(view) {
    currentAdminView = view;

    const sideLinkBookings = document.getElementById('side-link-bookings');
    const sideLinkCatalog = document.getElementById('side-link-catalog');
    const panelBookings = document.getElementById('panel-bookings');
    const panelCatalog = document.getElementById('panel-catalog');

    if (view === 'bookings') {
        sideLinkBookings.classList.add('active');
        sideLinkCatalog.classList.remove('active');
        panelBookings.style.display = 'block';
        panelCatalog.style.display = 'none';
    } else {
        sideLinkCatalog.classList.add('active');
        sideLinkBookings.classList.remove('active');
        panelCatalog.style.display = 'block';
        panelBookings.style.display = 'none';
    }
}

// Load bookings
async function loadBookings() {
    try {
        const response = await fetch('/api/bookings');
        bookingsList = await response.json();
        renderBookings();
    } catch (err) {
        console.error('Error fetching bookings:', err);
        document.getElementById('admin-bookings-table-body').innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;padding:40px;color:var(--c-red);">Не удалось загрузить заявки.</td>
            </tr>
        `;
    }
}

// Render bookings list table
function renderBookings() {
    const tbody = document.getElementById('admin-bookings-table-body');
    if (bookingsList.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;padding:40px;color:var(--c-text-2);">Заявок пока нет.</td>
            </tr>
        `;
        return;
    }

    const statusMap = {
        pending: { text: 'На рассмотрении', class: 'badge-pending' },
        approved: { text: 'Подтвержден', class: 'badge-approved' },
        rejected: { text: 'Отклонен', class: 'badge-rejected' },
        completed: { text: 'Завершен', class: 'badge-completed' }
    };

    tbody.innerHTML = bookingsList.map(b => {
        const status = statusMap[b.status] || { text: b.status, class: 'badge-pending' };
        const start = new Date(b.startDate).toLocaleDateString('ru-RU');
        const end = new Date(b.endDate).toLocaleDateString('ru-RU');

        let actionButtons = '';
        if (b.status === 'pending') {
            actionButtons = `
                <button onclick="updateBookingStatus(${b.id}, 'approved')" class="btn btn-success btn-sm" title="Подтвердить"><i class="fa-solid fa-check"></i></button>
                <button onclick="updateBookingStatus(${b.id}, 'rejected')" class="btn btn-danger btn-sm" title="Отклонить"><i class="fa-solid fa-xmark"></i></button>
            `;
        } else if (b.status === 'approved') {
            actionButtons = `
                <button onclick="updateBookingStatus(${b.id}, 'completed')" class="btn btn-secondary btn-sm">Завершить <i class="fa-solid fa-flag-checkered"></i></button>
            `;
        } else {
            actionButtons = `<span style="color:var(--c-text-3);">—</span>`;
        }

        return `
            <tr>
                <td>
                    <div style="display:flex;flex-direction:column;">
                        <span style="font-weight:700;">${b.userFullName}</span>
                        <span style="font-size:0.75rem;color:var(--c-text-2);">${b.userPhone}</span>
                    </div>
                </td>
                <td>
                    <div style="display:flex;align-items:center;gap:10px;">
                        <img src="${b.machineImage}" alt="${b.machineName}" style="width:44px;height:30px;object-fit:cover;border-radius:6px;">
                        <span style="font-weight:600;">${b.machineName}</span>
                    </div>
                </td>
                <td style="color:var(--c-text-2);">${start} — ${end}</td>
                <td style="font-weight:800;color:var(--c-yellow);">${b.totalPrice.toLocaleString('ru-RU')} ₽</td>
                <td><span class="badge ${status.class}">${status.text}</span></td>
                <td><div class="actions-cell">${actionButtons}</div></td>
            </tr>
        `;
    }).join('');
}

// Update Booking Status handler
async function updateBookingStatus(bookingId, status) {
    try {
        const response = await fetch(`/api/bookings/${bookingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            loadBookings();
            loadStats();
        } else {
            const data = await response.json();
            alert(`Ошибка при изменении статуса: ${data.error}`);
        }
    } catch (err) {
        console.error('Error changing booking status:', err);
    }
}

// Load machinery catalog
async function loadCatalog() {
    try {
        const response = await fetch('/api/machinery');
        machineryList = await response.json();
        renderCatalog();
    } catch (err) {
        console.error('Error loading machinery list:', err);
        document.getElementById('admin-catalog-table-body').innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: var(--danger);">Не удалось загрузить каталог.</td>
            </tr>
        `;
    }
}

// Render machinery list in catalog manager
function renderCatalog() {
    const tbody = document.getElementById('admin-catalog-table-body');
    if (machineryList.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;padding:40px;color:var(--c-text-2);">Каталог пуст. Добавьте технику.</td>
            </tr>
        `;
        return;
    }

    const categoryNames = {
        excavator: 'Экскаватор',
        truck: 'Самосвал',
        crane: 'Автокран',
        loader: 'Погрузчик',
        tractor: 'Трактор'
    };

    const statusMap = {
        available: { text: 'Доступна', class: 'badge-approved' },
        maintenance: { text: 'Ремонт', class: 'badge-pending' }
    };

    tbody.innerHTML = machineryList.map(item => {
        const status = statusMap[item.status] || { text: item.status, class: 'badge-pending' };

        return `
            <tr>
                <td>
                    <div style="display:flex;align-items:center;gap:12px;">
                        <img src="${item.imageUrl}" alt="${item.name}" style="width:54px;height:34px;object-fit:cover;border-radius:6px;">
                        <span style="font-weight:700;">${item.name}</span>
                    </div>
                </td>
                <td style="color:var(--c-text-2);">${categoryNames[item.category] || item.category}</td>
                <td style="font-weight:800;color:var(--c-yellow);">${item.price.toLocaleString('ru-RU')} ₽/сут</td>
                <td><span class="badge ${status.class}">${status.text}</span></td>
                <td>
                    <div class="actions-cell">
                        <button onclick="openMachineryModal(${item.id})" class="btn btn-secondary btn-sm" title="Редактировать"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button onclick="deleteMachine(${item.id})" class="btn btn-danger btn-sm" title="Удалить"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Machinery Modal Controls
function openMachineryModal(machineId = null) {
    const modal = document.getElementById('machinery-modal');
    const form = document.getElementById('machinery-form');
    const modalTitle = document.getElementById('machinery-modal-title');
    const statusGroup = document.getElementById('status-group');
    
    // Reset form
    form.reset();
    document.getElementById('machinery-error').style.display = 'none';
    document.getElementById('machinery-success').style.display = 'none';
    editMachineId = machineId;

    if (machineId) {
        // Edit mode
        modalTitle.innerText = 'Редактировать спецтехнику';
        statusGroup.style.display = 'block';

        const machine = machineryList.find(m => m.id === machineId);
        if (machine) {
            document.getElementById('machinery-form-id').value = machine.id;
            document.getElementById('machine-name').value = machine.name;
            document.getElementById('machine-category').value = machine.category;
            document.getElementById('machine-price').value = machine.price;
            document.getElementById('machine-image').value = machine.imageUrl;
            document.getElementById('machine-description').value = machine.description || '';
            document.getElementById('machine-status').value = machine.status;

            // Form specs parsing
            try {
                const specs = JSON.parse(machine.specs || '{}');
                document.getElementById('machine-specs').value = JSON.stringify(specs, null, 2);
            } catch (e) {
                document.getElementById('machine-specs').value = machine.specs || '{}';
            }
        }
    } else {
        // Add mode
        modalTitle.innerText = 'Добавить новую технику';
        statusGroup.style.display = 'none';
        document.getElementById('machinery-form-id').value = '';
    }

    modal.classList.add('active');
}

function closeMachineryModal() {
    document.getElementById('machinery-modal').classList.remove('active');
    editMachineId = null;
}

// Submit Add/Edit Machinery Form
async function submitMachineryForm(event) {
    event.preventDefault();

    const name = document.getElementById('machine-name').value.trim();
    const category = document.getElementById('machine-category').value;
    const price = document.getElementById('machine-price').value;
    const imageUrl = document.getElementById('machine-image').value.trim();
    const description = document.getElementById('machine-description').value.trim();
    const specsStr = document.getElementById('machine-specs').value.trim() || '{}';
    const status = document.getElementById('machine-status').value;

    const errorDiv = document.getElementById('machinery-error');
    const successDiv = document.getElementById('machinery-success');
    const submitBtn = document.getElementById('machinery-submit-btn');

    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';

    // Parse specs JSON
    let specs = {};
    try {
        specs = JSON.parse(specsStr);
    } catch (e) {
        errorDiv.innerText = 'Некорректный формат характеристик JSON. Проверьте скобки и запятые.';
        errorDiv.style.display = 'block';
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Сохранение... <i class="fa-solid fa-spinner fa-spin"></i>';

    const payload = {
        name,
        category,
        price: parseFloat(price),
        imageUrl,
        description,
        specs,
        status: editMachineId ? status : 'available'
    };

    const url = editMachineId ? `/api/machinery/${editMachineId}` : '/api/machinery';
    const method = editMachineId ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            errorDiv.innerText = data.error || 'Ошибка при сохранении спецтехники';
            errorDiv.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Сохранить <i class="fa-solid fa-save"></i>';
            return;
        }

        successDiv.innerText = editMachineId ? 'Информация о технике успешно обновлена' : 'Техника успешно добавлена в базу';
        successDiv.style.display = 'block';

        setTimeout(() => {
            closeMachineryModal();
            loadCatalog();
            loadStats();
        }, 1500);

    } catch (err) {
        console.error('Machinery submission error:', err);
        errorDiv.innerText = 'Ошибка соединения с сервером. Пожалуйста, повторите попытку.';
        errorDiv.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Сохранить <i class="fa-solid fa-save"></i>';
    }
}

// Delete Machinery soft-delete handler
async function deleteMachine(machineId) {
    if (!confirm('Вы уверены, что хотите удалить эту спецтехнику из каталога?')) return;

    try {
        const response = await fetch(`/api/machinery/${machineId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadCatalog();
            loadStats();
        } else {
            const data = await response.json();
            alert(`Ошибка удаления: ${data.error}`);
        }
    } catch (err) {
        console.error('Error deleting machine:', err);
    }
}

// Logout handler
async function logout() {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = 'index.html';
    } catch (err) {
        console.error('Logout error:', err);
    }
}
