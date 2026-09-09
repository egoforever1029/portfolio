function switchTab(tab) {
    const loginTab = document.getElementById('tab-login');
    const registerTab = document.getElementById('tab-register');
    const loginForm = document.getElementById('form-login');
    const registerForm = document.getElementById('form-register');

    if (tab === 'login') {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    } else {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    const usernameInput = document.getElementById('login-username').value.trim();
    const passwordInput = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    
    errorDiv.style.display = 'none';

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: usernameInput,
                password: passwordInput
            })
        });

        const data = await response.json();

        if (!response.ok) {
            errorDiv.innerText = data.error || 'Произошла ошибка при входе';
            errorDiv.style.display = 'block';
            return;
        }

        // Auth success, redirect based on user role
        if (data.user.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'profile.html';
        }

    } catch (err) {
        console.error('Error logging in:', err);
        errorDiv.innerText = 'Не удалось подключиться к серверу. Попробуйте позже.';
        errorDiv.style.display = 'block';
    }
}

async function handleRegister(event) {
    event.preventDefault();

    const fullNameInput = document.getElementById('reg-fullname').value.trim();
    const usernameInput = document.getElementById('reg-username').value.trim();
    const phoneInput = document.getElementById('reg-phone').value.trim();
    const passwordInput = document.getElementById('reg-password').value;
    const errorDiv = document.getElementById('reg-error');

    errorDiv.style.display = 'none';

    if (passwordInput.length < 6) {
        errorDiv.innerText = 'Пароль должен содержать не менее 6 символов';
        errorDiv.style.display = 'block';
        return;
    }

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fullName: fullNameInput,
                username: usernameInput,
                phone: phoneInput,
                password: passwordInput
            })
        });

        const data = await response.json();

        if (!response.ok) {
            errorDiv.innerText = data.error || 'Произошла ошибка при регистрации';
            errorDiv.style.display = 'block';
            return;
        }

        // Registration success, redirect to profile
        window.location.href = 'profile.html';

    } catch (err) {
        console.error('Error registering:', err);
        errorDiv.innerText = 'Не удалось подключиться к серверу. Попробуйте позже.';
        errorDiv.style.display = 'block';
    }
}
