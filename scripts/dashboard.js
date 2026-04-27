document.addEventListener('DOMContentLoaded', initDashboard);

async function initDashboard() {
    try {
        const res = await fetch('/api/users/me');
        const data = await res.json();

        if (res.ok && data.role === 'admin') {
            document.getElementById('admin-section').style.display = 'flex';
        }
    } catch (error) {
        console.error('Failed to load user info:', error);
    }
}

function openAdminModal() {
    document.getElementById('admin-modal').style.display = 'flex';
}

function closeAdminModal() {
    document.getElementById('admin-modal').style.display = 'none';
}