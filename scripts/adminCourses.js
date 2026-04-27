const courseList = document.getElementById('course-list');
const adminMessage = document.getElementById('admin-message');
const searchInput = document.getElementById('course-search');

let allCourses = [];
let isAdding = false;

document.addEventListener('DOMContentLoaded', loadCourses);
searchInput.addEventListener('input', filterCourses);

async function loadCourses() {
    try {
        const res = await fetch('/api/courses');
        const data = await readJson(res);
        if (!res.ok) throw new Error(data.message || 'Failed to load courses.');
        allCourses = data;
        renderCourses(allCourses);
    } catch (err) {
        setMessage(err.message, true);
        courseList.innerHTML = '<div class="cart-card empty-state">Unable to load courses.</div>';
    }
}

function filterCourses() {
    const q = searchInput.value.trim().toLowerCase();
    const filtered = allCourses.filter(c =>
        c._id.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q)
    );
    renderCourses(filtered);
}

function renderCourses(courses) {
    if (!courses.length) {
        courseList.innerHTML = '<div class="cart-card empty-state">No courses found.</div>';
        return;
    }

    courseList.innerHTML = courses.map(c => `
        <details class="cart-card">
            <summary>
                <div class="cart-summary-row">
                    <span class="cart-summary-text">${escapeHtml(c._id)} — ${escapeHtml(c.name)}</span>
                </div>
            </summary>
            <div class="cart-details">
                <p class="cart-meta"><strong>Credits:</strong> ${c.credits}</p>
                <p class="cart-meta"><strong>Department:</strong> ${escapeHtml(c.department || 'None')}</p>
                <p class="cart-description"><strong>Description:</strong> ${escapeHtml(c.description || 'None')}</p>
                <p class="cart-meta"><strong>Prerequisites:</strong> ${escapeHtml(formatList(c.prerequisite))}</p>
                <p class="cart-meta"><strong>Corequisites:</strong> ${escapeHtml(formatList(c.corequisite))}</p>
                <p class="cart-meta"><strong>Requirement Tags:</strong> ${escapeHtml(formatList(c.requirementTag))}</p>
                <div style="display:flex; gap:0.75rem; margin-top:0.75rem;">
                    <button class="action-button"
                        data-course="${escapeAttr(JSON.stringify(c))}"
                        onclick="handleEditClick(this)">Edit</button>
                    <button class="action-button" style="color:rgb(254,202,202);"
                        data-id="${escapeHtml(c._id)}"
                        data-name="${escapeHtml(c.name)}"
                        onclick="handleDeleteClick(this)">Delete</button>
                </div>
            </div>
        </details>
    `).join('');
}

function handleEditClick(btn) {
    const course = JSON.parse(btn.dataset.course);
    openEditModal(course);
}

function handleDeleteClick(btn) {
    deleteCourse(btn.dataset.id, btn.dataset.name);
}

function openAddModal() {
    isAdding = true;
    document.getElementById('modal-title').textContent = 'Add Course';
    document.getElementById('edit-course-id').value = '';
    document.getElementById('edit-id').value = '';
    document.getElementById('edit-id').disabled = false;
    document.getElementById('edit-name').value = '';
    document.getElementById('edit-credits').value = '';
    document.getElementById('edit-department').value = '';
    document.getElementById('edit-description').value = '';
    document.getElementById('edit-prerequisite').value = '';
    document.getElementById('edit-corequisite').value = '';
    document.getElementById('edit-requirementTag').value = '';
    document.getElementById('edit-modal').style.display = 'flex';
}

function openEditModal(course) {
    isAdding = false;
    document.getElementById('modal-title').textContent = 'Edit Course';
    document.getElementById('edit-course-id').value = course._id;
    document.getElementById('edit-id').value = course._id;
    document.getElementById('edit-id').disabled = true; // ID shouldn't change
    document.getElementById('edit-name').value = course.name;
    document.getElementById('edit-credits').value = course.credits;
    document.getElementById('edit-department').value = course.department || '';
    document.getElementById('edit-description').value = course.description || '';
    document.getElementById('edit-prerequisite').value = (course.prerequisite || []).join(', ');
    document.getElementById('edit-corequisite').value = (course.corequisite || []).join(', ');
    document.getElementById('edit-requirementTag').value = (course.requirementTag || []).join(', ');
    document.getElementById('edit-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('edit-modal').style.display = 'none';
}

function parseArray(value) {
    return value.split(',').map(v => v.trim()).filter(Boolean);
}

async function saveCourse() {
    const id = document.getElementById('edit-id').value.trim();
    const body = {
        name: document.getElementById('edit-name').value.trim(),
        credits: Number(document.getElementById('edit-credits').value),
        department: document.getElementById('edit-department').value.trim(),
        description: document.getElementById('edit-description').value.trim(),
        prerequisite: parseArray(document.getElementById('edit-prerequisite').value),
        corequisite: parseArray(document.getElementById('edit-corequisite').value),
        requirementTag: parseArray(document.getElementById('edit-requirementTag').value)
    };

    if (!id || !body.name || isNaN(body.credits)) {
        setMessage('Course ID, name, and credits are required.', true);
        return;
    }

    try {
        let res;
        if (isAdding) {
            res = await fetch('/api/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ _id: id, ...body })
            });
        } else {
            res = await fetch(`/api/courses/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
        }

        const data = await readJson(res);
        if (!res.ok) throw new Error(data.message || 'Failed to save course.');

        setMessage(isAdding ? 'Course added successfully.' : 'Course updated successfully.', false);
        closeModal();
        await loadCourses();
    } catch (err) {
        setMessage(err.message, true);
    }
}

async function deleteCourse(id, name) {
    if (!confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) return;

    try {
        const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
        const data = await readJson(res);
        if (!res.ok) throw new Error(data.message || 'Failed to delete course.');

        setMessage(`${name} has been deleted.`, false);
        await loadCourses();
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