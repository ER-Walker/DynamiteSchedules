document.getElementById('logout-button').addEventListener('click', logout);

async function logout() {
    await fetch('/api/users/logout', {
        method: 'POST' });
        window.location.href = '/';
}