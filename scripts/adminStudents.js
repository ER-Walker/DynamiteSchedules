const studentList = document.getElementById('student-list');
const adminMessage = document.getElementById('admin-message');
const searchInput = document.getElementById('student-search');

let allStudents = [];

document.addEventListener('DOMContentLoaded', loadStudents);
searchInput.addEventListener('input', filterStudents);

async function loadStudents() {
    try {
        const res = await fetch('/api/students');
        const data = await readJson(res);

        if (!res.ok) throw new Error(data.message || 'Failed to load students.');

        allStudents = data;
        renderStudents(allStudents);
    } catch (err) {
        setMessage(err.message, true);
        studentList.innerHTML = '<div class="cart-card empty-state">Unable to load students.</div>';
    }
}

function filterStudents() {
    const q = searchInput.value.trim().toLowerCase();
    const filtered = allStudents.filter(s =>
        s.firstName.toLowerCase().includes(q) ||
        s.lastName.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q)
    );
    renderStudents(filtered);
}

function renderStudents(students) {
    if (!students.length) {
        studentList.innerHTML = '<div class="cart-card empty-state">No students found.</div>';
        return;
    }

    studentList.innerHTML = students.map(s => `
        <details class="cart-card">
            <summary>
                <div class="cart-summary-row">
                    <span class="cart-summary-text">${escapeHtml(s.lastName)}, ${escapeHtml(s.firstName)} — ${escapeHtml(s.studentId)}</span>
                </div>
            </summary>
            <div class="cart-details">
                <p class="cart-meta"><strong>Email:</strong> ${escapeHtml(s.email)}</p>
                <p class="cart-meta"><strong>Major:</strong> ${escapeHtml(s.major)}</p>
                <p class="cart-meta"><strong>Track:</strong> ${escapeHtml(s.track)}</p>
                <p class="cart-meta"><strong>Current Classes:</strong> ${escapeHtml(formatList(s.currentClasses))}</p>
                <p class="cart-meta"><strong>Completed Classes:</strong> ${escapeHtml(formatList(s.completedClasses))}</p>
                <div style="display:flex; gap:0.75rem; margin-top:0.75rem;">
                    <button class="action-button"
                        data-student="${escapeAttr(JSON.stringify(s))}"
                        onclick="handleEditClick(this)">Edit</button>
                    <button class="action-button" style="color:rgb(254,202,202);"
                        data-id="${escapeHtml(s._id)}"
                        data-name="${escapeHtml(s.firstName)} ${escapeHtml(s.lastName)}"
                        onclick="handleDeleteClick(this)">Delete</button>
                </div>
            </div>
        </details>
    `).join('');
}

function handleEditClick(btn) {
    const student = JSON.parse(btn.dataset.student);
    openEditModal(student);
}

function handleDeleteClick(btn) {
    deleteStudent(btn.dataset.id, btn.dataset.name);
}

function openEditModal(student) {
    document.getElementById('edit-student-id').value = student._id;
    document.getElementById('edit-firstName').value = student.firstName;
    document.getElementById('edit-lastName').value = student.lastName;
    document.getElementById('edit-email').value = student.email;
    document.getElementById('edit-major').value = student.major;
    document.getElementById('edit-track').value = student.track;
    document.getElementById('edit-modal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
}

async function saveStudentEdit() {
    const id = document.getElementById('edit-student-id').value;
    const body = {
        firstName: document.getElementById('edit-firstName').value,
        lastName: document.getElementById('edit-lastName').value,
        email: document.getElementById('edit-email').value,
        major: document.getElementById('edit-major').value,
        track: document.getElementById('edit-track').value
    };

    try {
        const res = await fetch(`/api/students/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await readJson(res);
        if (!res.ok) throw new Error(data.message || 'Failed to update student.');

        setMessage('Student updated successfully.', false);
        closeEditModal();
        await loadStudents();
    } catch (err) {
        setMessage(err.message, true);
    }
}

async function deleteStudent(id, name) {
    if (!confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) return;

    try {
        const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
        const data = await readJson(res);
        if (!res.ok) throw new Error(data.message || 'Failed to delete student.');

        setMessage(`${name} has been deleted.`, false);
        await loadStudents();
    } catch (err) {
        setMessage(err.message, true);
    }
}

function formatList(arr) {
    return Array.isArray(arr) && arr.filter(v => v).length ? arr.join(', ') : 'None';
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeAttr(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;');
}

function setMessage(msg, isError) {
    adminMessage.textContent = msg;
    adminMessage.className = isError ? 'cart-message error' : 'cart-message';
}

async function readJson(res) {
    const ct = res.headers.get('content-type') || '';
    return ct.includes('application/json') ? res.json() : { message: 'Unexpected server response.' };
}