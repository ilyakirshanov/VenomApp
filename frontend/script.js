// ============================================================
// script.js – клиентский код для Venom Gallery (УЯЗВИМАЯ ВЕРСИЯ)
// ============================================================

/* -------------------- Навигация -------------------- */
function updateNav() {
    const navLinks = document.getElementById('nav-links');
    const user = localStorage.getItem('user');
    if (user) {
        const parsed = JSON.parse(user);
        navLinks.innerHTML = `
            <a href="/profile">Профиль</a>
            ${parsed.is_admin ? '<a href="/admin">Админ</a>' : ''}
            <a href="#" id="logout-link">Выход</a>
        `;
        document.getElementById('logout-link').addEventListener('click', logout);
    } else {
        navLinks.innerHTML = `
            <a href="/login">Вход</a>
            <a href="/register">Регистрация</a>
        `;
    }
}

/* -------------------- Авторизация и выход -------------------- */
async function logout() {
    await fetch('/api/logout', { method: 'POST' });
    localStorage.removeItem('user');
    window.location.href = '/';
}

// Обработка входа
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = '/';
        } else {
            alert(data.error || 'Ошибка входа');
        }
    });
}

// Обработка регистрации
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('reg-username').value;
        const password = document.getElementById('reg-password').value;
        const email = document.getElementById('reg-email').value;
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, email })
        });
        const data = await res.json();
        if (res.ok) {
            alert('Регистрация успешна! Теперь войдите.');
            window.location.href = '/login';
        } else {
            alert(data.error || 'Ошибка регистрации');
        }
    });
}

/* -------------------- Посты (главная страница) -------------------- */
async function loadPosts() {
    const container = document.getElementById('posts');
    if (!container) return;
    const res = await fetch('/api/posts');
    const posts = await res.json();
    // УЯЗВИМОСТЬ XSS: вставка HTML без санитизации
    container.innerHTML = posts.map(post => `
        <div class="card">
            <img src="/api/download/${post.image_path}" alt="${post.caption}" style="max-width:100%;">
            <p>${post.caption}</p>
            <small>${post.created_at}</small>
        </div>
    `).join('');
}

/* -------------------- Профиль -------------------- */
async function loadProfile() {
    const infoDiv = document.getElementById('user-info');
    if (!infoDiv) return;
    const res = await fetch('/api/me');
    const user = await res.json();
    if (res.ok) {
        // УЯЗВИМОСТЬ XSS: вставка HTML из пользовательских данных
        infoDiv.innerHTML = `
            <p><strong>Имя:</strong> ${user.username}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Админ:</strong> ${user.is_admin ? 'Да' : 'Нет'}</p>
        `;
    } else {
        infoDiv.textContent = 'Не удалось загрузить данные';
    }
}

// Смена пароля
const changePasswordForm = document.getElementById('change-password-form');
if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('profile-username').value;
        const newPassword = document.getElementById('new-password').value;
        const res = await fetch('/api/update_password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ new_password: newPassword }) // username игнорируется сервером (IDOR)
        });
        const data = await res.json();
        alert(data.message || data.error);
    });
}

// Смена email
const changeEmailForm = document.getElementById('change-email-form');
if (changeEmailForm) {
    changeEmailForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('profile-username-email').value;
        const newEmail = document.getElementById('new-email').value;
        const res = await fetch('/api/update_password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ new_email: newEmail })
        });
        const data = await res.json();
        alert(data.message || data.error);
    });
}

/* -------------------- Админ-панель -------------------- */
// Загрузка списка пользователей
async function loadUsers() {
    const userList = document.getElementById('user-list');
    if (!userList) return;
    const res = await fetch('/api/admin/users');
    const users = await res.json();
    if (res.ok) {
        // УЯЗВИМОСТЬ XSS: вставка через innerHTML
        userList.innerHTML = users.map(user => `
            <li>
                ${user.username} (${user.email})
                ${user.is_admin ? 'ADMIN' : ''}
                <button onclick="deleteUser(${user.id})">Удалить</button>
            </li>
        `).join('');
    } else {
        userList.textContent = 'Доступ запрещён';
    }
}

// Удаление пользователя (IDOR + SQLi на сервере)
async function deleteUser(id) {
    if (!confirm('Удалить пользователя?')) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    const data = await res.json();
    alert(data.message || data.error);
    loadUsers();
}

// Создание поста (только админ)
const createPostForm = document.getElementById('create-post-form');
if (createPostForm) {
    createPostForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('caption', document.getElementById('post-caption').value);
        formData.append('image', document.getElementById('post-image').files[0]);
        const res = await fetch('/api/posts', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        alert(data.message || data.error);
    });
}


/* -------------------- Инициализация -------------------- */
document.addEventListener('DOMContentLoaded', () => {
    updateNav();
    loadPosts();
    loadProfile();
    loadUsers();
});