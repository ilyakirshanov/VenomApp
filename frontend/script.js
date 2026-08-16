/*
Безопасная версия, были убраны вставки пользовательских данных с innerHTML, 
вместо них реализованы функции, использующие textContent и createElement, что предотвращает XSS-атаки.
*/
async function getCurrentUser() {
    try {
        const res = await fetch('/api/me');
        if (res.ok) {
            return await res.json();
        }
        return null;
    } catch (e) {
        console.error('Ошибка получения пользователя:', e);
        return null;
    }
}


async function updateNav() {
    const navLinks = document.getElementById('nav-links');
    if (!navLinks) return;
    navLinks.innerHTML = ''; 

    const user = await getCurrentUser();

    if (user) {
        const profileLink = document.createElement('a');
        profileLink.href = '/profile';
        profileLink.textContent = 'Профиль';
        navLinks.appendChild(profileLink);

        // только для админов
        if (user.is_admin) {
            const adminLink = document.createElement('a');
            adminLink.href = '/admin';
            adminLink.textContent = 'Админ';
            navLinks.appendChild(adminLink);
        }

        
        const logoutLink = document.createElement('a');
        logoutLink.href = '#';
        logoutLink.textContent = 'Выход';
        logoutLink.id = 'logout-link';
        navLinks.appendChild(logoutLink);

        logoutLink.addEventListener('click', async (e) => {
            e.preventDefault();
            await fetch('/api/logout', { method: 'POST' });
            window.location.href = '/';
        });
    } else {
        const loginLink = document.createElement('a');
        loginLink.href = '/login';
        loginLink.textContent = 'Вход';
        navLinks.appendChild(loginLink);

        const registerLink = document.createElement('a');
        registerLink.href = '/register';
        registerLink.textContent = 'Регистрация';
        navLinks.appendChild(registerLink);
    }
}


const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (res.ok) {
                window.location.href = '/';
            } else {
                alert(data.error || 'Ошибка входа');
            }
        } catch (e) {
            alert('Ошибка соединения');
        }
    });
}


const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('reg-username').value;
        const password = document.getElementById('reg-password').value;
        const email = document.getElementById('reg-email').value || '';
        try {
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
        } catch (e) {
            alert('Ошибка соединения');
        }
    });
}


async function loadPosts() {
    const container = document.getElementById('posts');
    if (!container) return;
    try {
        const res = await fetch('/api/posts');
        const posts = await res.json();
        container.innerHTML = ''; 

        posts.forEach(post => {
            const card = document.createElement('div');
            card.className = 'card';

            const img = document.createElement('img');
            img.src = `/api/download/${post.image_path}`;
            img.alt = post.caption || 'Изображение';
            img.style.maxWidth = '100%';

            const captionP = document.createElement('p');
            captionP.textContent = post.caption || '';

            const small = document.createElement('small');
            small.textContent = post.created_at || '';

            card.append(img, captionP, small);
            container.appendChild(card);
        });
    } catch (e) {
        console.error('Ошибка загрузки постов:', e);
        container.textContent = 'Не удалось загрузить посты';
    }
}

async function loadProfile() {
    const infoDiv = document.getElementById('user-info');
    if (!infoDiv) return;
    try {
        const user = await getCurrentUser();
        if (!user) {
            infoDiv.textContent = 'Пожалуйста, войдите.';
            return;
        }
        infoDiv.innerHTML = '';

        
        const nameP = document.createElement('p');
        nameP.innerHTML = '<strong>Имя:</strong> ';
        const nameSpan = document.createElement('span');
        nameSpan.textContent = user.username;
        nameP.appendChild(nameSpan);
        infoDiv.appendChild(nameP);

        
        const emailP = document.createElement('p');
        emailP.innerHTML = '<strong>Email:</strong> ';
        const emailSpan = document.createElement('span');
        emailSpan.textContent = user.email || 'не указан';
        emailP.appendChild(emailSpan);
        infoDiv.appendChild(emailP);

        
        const adminP = document.createElement('p');
        adminP.innerHTML = '<strong>Админ:</strong> ';
        const adminSpan = document.createElement('span');
        adminSpan.textContent = user.is_admin ? 'Да' : 'Нет';
        adminP.appendChild(adminSpan);
        infoDiv.appendChild(adminP);
    } catch (e) {
        infoDiv.textContent = 'Ошибка загрузки профиля';
    }
}

const changePasswordForm = document.getElementById('change-password-form');
if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPassword = document.getElementById('new-password').value;
        if (!newPassword) {
            alert('Введите новый пароль');
            return;
        }
        try {
            const res = await fetch('/api/update_profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ new_password: newPassword })
            });
            const data = await res.json();
            alert(data.message || data.error);
        } catch (e) {
            alert('Ошибка соединения');
        }
    });
}


const changeEmailForm = document.getElementById('change-email-form');
if (changeEmailForm) {
    changeEmailForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newEmail = document.getElementById('new-email').value;
        if (!newEmail) {
            alert('Введите новый email');
            return;
        }
        try {
            const res = await fetch('/api/update_profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ new_email: newEmail })
            });
            const data = await res.json();
            alert(data.message || data.error);
        } catch (e) {
            alert('Ошибка соединения');
        }
    });
}

async function loadUsers() {
    const userList = document.getElementById('user-list');
    if (!userList) return;
    try {
        const res = await fetch('/api/admin/users');
        if (!res.ok) {
            userList.textContent = 'Доступ запрещён';
            return;
        }
        const users = await res.json();
        userList.innerHTML = '';

        users.forEach(user => {
            const li = document.createElement('li');

            
            const textSpan = document.createElement('span');
            textSpan.textContent = `${user.username} (${user.email || 'no email'})`;
            li.appendChild(textSpan);

            if (user.is_admin) {
                const adminSpan = document.createElement('span');
                adminSpan.textContent = ' ADMIN';
                adminSpan.style.fontWeight = 'bold';
                li.appendChild(adminSpan);
            }

            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Удалить';
            deleteBtn.addEventListener('click', () => deleteUser(user.id));
            li.appendChild(deleteBtn);

            userList.appendChild(li);
        });
    } catch (e) {
        userList.textContent = 'Ошибка загрузки списка пользователей';
    }
}


async function deleteUser(id) {
    if (!confirm('Удалить пользователя?')) return;
    try {
        const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
        const data = await res.json();
        alert(data.message || data.error);
        loadUsers(); 
    } catch (e) {
        alert('Ошибка соединения');
    }
}


const createPostForm = document.getElementById('create-post-form');
if (createPostForm) {
    createPostForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData();
        const caption = document.getElementById('post-caption').value;
        const image = document.getElementById('post-image').files[0];
        if (!image) {
            alert('Выберите изображение');
            return;
        }
        formData.append('caption', caption);
        formData.append('image', image);
        try {
            const res = await fetch('/api/posts', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            alert(data.message || data.error);
            if (res.ok) {
                document.getElementById('post-caption').value = '';
                document.getElementById('post-image').value = '';
                loadPosts(); 
            }
        } catch (e) {
            alert('Ошибка соединения');
        }
    });
}


document.addEventListener('DOMContentLoaded', async () => {
    const path = window.location.pathname;

    await updateNav();

    if (path === '/') {
        loadPosts();
    } else if (path === '/profile') {
        const user = await getCurrentUser();
        if (!user) {
            window.location.href = '/login';
            return;
        }
        loadProfile();
    } else if (path === '/admin') {
        const user = await getCurrentUser();
        if (!user || !user.is_admin) {
            alert('Доступ запрещён');
            window.location.href = '/';
            return;
        }
        loadUsers();
    }
});