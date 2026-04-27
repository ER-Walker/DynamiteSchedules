const classesList = document.getElementById('classes-list');
const classesMessage = document.getElementById('classes-message');

document.addEventListener('DOMContentLoaded', loadCurrentClasses);

async function loadCurrentClasses() {
    try {
        const res = await fetch('/api/students/currentClasses');
        const data = await readJsonResponse(res);

        if (!res.ok) {
            throw new Error(data.message || 'Failed to load current classes');
        }

        const courses = data.currentClasses || [];

        if (!courses.length) {
            classesList.innerHTML = '<div class="cart-card empty-state">No current classes enrolled.</div>';
            return;
        }

        classesList.innerHTML = courses.map(course => `
            <details class="cart-card">
                <summary>
                    <div class="cart-summary-row">
                        <span class="cart-summary-text">${escapeHtml(course._id)} - ${escapeHtml(course.name)}</span>
                    </div>
                </summary>
                <div class="cart-details">
                    <p class="cart-meta"><strong>Credits:</strong> ${course.credits}</p>
                    <p class="cart-meta"><strong>Department:</strong> ${escapeHtml(course.department || 'None')}</p>
                    <p class="cart-description"><strong>Description:</strong> ${escapeHtml(course.description || 'No description available.')}</p>
                    <p class="cart-meta"><strong>Prerequisites:</strong> ${escapeHtml(formatList(course.prerequisite))}</p>
                </div>
            </details>
        `).join('');
    } catch (error) {
        setMessage(error.message, true);
        classesList.innerHTML = '<div class="cart-card empty-state">Unable to load current classes.</div>';
    }
}

function formatList(values) {
    return Array.isArray(values) && values.filter(v => v).length ? values.filter(v => v).join(', ') : 'None';
}

function escapeHtml(value) {
    return String(value).replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
}

function setMessage(message, isError) {
    classesMessage.textContent = message;
    classesMessage.className = isError ? 'cart-message error' : 'cart-message';
}

async function readJsonResponse(res) {
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        return res.json();
    }
    return  {message: 'The server returned an unexpected response.' };
}