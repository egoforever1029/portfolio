let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    initProfile();
});

async function initProfile() {
    try {
        // Check auth
        const meResponse = await fetch('/api/auth/me');
        const meData = await meResponse.json();
        
        if (!meData.user) {
            window.location.href = 'auth.html';
            return;
        }
        
        currentUser = meData.user;
        renderUserInfo();
        loadBookings();
    } catch (err) {
        console.error('Profile initialization failed:', err);
        window.location.href = 'auth.html';
    }
}

// Render user profile card info
function renderUserInfo() {
    document.getElementById('profile-fullname').innerText = currentUser.fullName;
    document.getElementById('profile-phone').innerText = currentUser.phone;

    if (currentUser.role === 'admin') {
        const adminContainer = document.getElementById('admin-panel-link-container');
        if (adminContainer) {
            adminContainer.innerHTML = `
                <a href="admin.html" class="sidebar-link">
                    <i class="fa-solid fa-gauge-high"></i> Панель управления
                </a>
            `;
        }
    }
}

// Load bookings history
async function loadBookings() {
    try {
        const response = await fetch('/api/bookings/my');
        const bookings = await response.json();
        
        renderBookings(bookings);
        calculateStats(bookings);
    } catch (err) {
        console.error('Error fetching bookings:', err);
        document.getElementById('bookings-table-body').innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;padding:40px;color:var(--c-red);">Не удалось загрузить историю заказов.</td>
            </tr>
        `;
    }
}

// Render bookings table list
function renderBookings(bookings) {
    const tbody = document.getElementById('bookings-table-body');
    if (bookings.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;padding:40px;color:var(--c-text-2);">Заказов пока нет. <a href="index.html#catalog" style="color:var(--c-yellow);font-weight:700;">Перейти в каталог</a></td>
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

    tbody.innerHTML = bookings.map(b => {
        const status = statusMap[b.status] || { text: b.status, class: 'badge-pending' };
        const start = new Date(b.startDate).toLocaleDateString('ru-RU');
        const end = new Date(b.endDate).toLocaleDateString('ru-RU');

        return `
            <tr>
                <td>
                    <div style="display:flex;align-items:center;gap:12px;">
                        <img src="${b.machineImage}" alt="${b.machineName}" style="width:46px;height:32px;object-fit:cover;border-radius:6px;border:1px solid rgba(255,255,255,0.07);">
                        <span style="font-weight:700;">${b.machineName}</span>
                    </div>
                </td>
                <td style="color:var(--c-text-2);">${start} — ${end}</td>
                <td style="font-weight:800;color:var(--c-yellow);">${b.totalPrice.toLocaleString('ru-RU')} ₽</td>
                <td><span class="badge ${status.class}">${status.text}</span></td>
                <td style="font-size:0.85rem;color:var(--c-text-2);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${b.comment || ''}">${b.comment || '—'}</td>
            </tr>
        `;
    }).join('');
}

// Calculate summary stats
function calculateStats(bookings) {
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const totalSpent = bookings
        .filter(b => b.status === 'approved' || b.status === 'completed')
        .reduce((sum, b) => sum + b.totalPrice, 0);

    document.getElementById('stat-total-bookings').innerText = totalBookings;
    document.getElementById('stat-pending-bookings').innerText = pendingBookings;
    document.getElementById('stat-total-spent').innerText = `${totalSpent.toLocaleString('ru-RU')} ₽`;
}

// Logout script
async function logout() {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = 'index.html';
    } catch (err) {
        console.error('Logout error:', err);
    }
}
