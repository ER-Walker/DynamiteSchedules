 const MAX_SELECTION = 5;
const AVAILABLE_HOURS = [9, 10, 11, 12, 13, 14];
const DAYS_MWF = ['Mon', 'Wed', 'Fri'];
const DAYS_TUTH = ['Tue', 'Thu'];
 
// Per-course accent colors — readable on red-800 backgrounds.
// Full class strings kept intact so PostCSS content scanning picks them up.
const PALETTE = [
    { label: 'text-yellow-300',  cellBg: 'bg-yellow-300/20',  hex: '#fde047' },
    { label: 'text-sky-300',     cellBg: 'bg-sky-300/20',     hex: '#7dd3fc' },
    { label: 'text-emerald-300', cellBg: 'bg-emerald-300/20', hex: '#6ee7b7' },
    { label: 'text-pink-300',    cellBg: 'bg-pink-300/20',    hex: '#f9a8d4' },
    { label: 'text-orange-300',  cellBg: 'bg-orange-300/20',  hex: '#fdba74' },
];
 
(function injectBaseStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .course-checkbox {
            appearance: none;
            -webkit-appearance: none;
            width: 16px; height: 16px;
            border: 2px solid #fff;
            border-radius: 3px;
            flex-shrink: 0;
            cursor: pointer;
            background: transparent;
            transition: background 150ms, border-color 150ms;
            position: relative;
        }
        .course-checkbox:checked {
            background: rgb(253,186,116);
            border-color: rgb(253,186,116);
        }
        .course-checkbox:checked::after {
            content: '';
            position: absolute;
            inset: 2px 3px;
            border: 2px solid #1f2937;
            border-top: none;
            border-right: none;
            transform: rotate(-45deg) translateY(-1px);
        }
        .course-checkbox:disabled {
            cursor: not-allowed;
            opacity: 0.4;
        }
        .schedule-grid {
            display: grid;
            grid-template-columns: 68px repeat(5, 1fr);
        }
        .schedule-cards {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 0.5rem;
        }
        .cell-accent { position: relative; }
        .cell-accent::before {
            content: '';
            position: absolute;
            left: 0; top: 0; bottom: 0;
            width: 3px;
            background: var(--cell-color);
        }
    `;
    document.head.appendChild(style);
})();
  
const state = {
    courses: [],
    selectedCourseIds: new Set(),
    generatedSchedule: null,
};
 
 
const courseList = document.getElementById('course-list');
const buildButton = document.getElementById('build-schedule-button');
const clearButton = document.getElementById('clear-schedule-button');
const regenerateButton = document.getElementById('regenerate-button');
const scheduleSection = document.getElementById('schedule-section');
const schedulePlaceholder = document.getElementById('schedule-placeholder');
const scheduleGrid = document.getElementById('schedule-grid');
const scheduleCards = document.getElementById('schedule-cards');
const scheduleMessage = document.getElementById('schedule-message');
  
document.addEventListener('DOMContentLoaded', () => {
    buildButton.addEventListener('click', buildSchedule);
    clearButton.addEventListener('click', clearSchedule);
    regenerateButton.addEventListener('click', buildSchedule);
    courseList.addEventListener('change', handleSelectionChange);
    loadCartCourses();
});
  
async function loadCartCourses() {
    try {
        const response = await fetch('/api/students/cart');
        const data = await readJsonResponse(response);
 
        if (!response.ok) throw new Error(data.message || 'Failed to load cart.');
 
        state.courses = (data.courses || []).slice(0, MAX_SELECTION);
        state.selectedCourseIds = new Set();
        renderCourseList(state.courses);
        updateUI();
    } catch (error) {
        courseList.innerHTML = `
            <p class="text-white font-mono text-sm">Unable to load cart right now.</p>
        `;
        buildButton.disabled = true;
        clearButton.disabled = true;
        setMessage(error.message || 'Unable to load cart right now.', true);
    }
}
  
function renderCourseList(courses) {
    if (!courses.length) {
        courseList.innerHTML = `
            <p class="text-white font-mono text-sm">No courses in the cart yet.</p>
        `;
        return;
    }
 
    courseList.innerHTML = courses.map((course) => {
        const dept = getDepartmentValue(course) || 'N/A';
        return `
            <label
                class="flex flex-row items-start gap-2 bg-[rgb(31,41,55)] border border-white rounded-md px-3 py-2 cursor-pointer text-left w-full"
                data-course-id="${escapeHtml(course._id)}"
            >
                <input
                    class="course-checkbox mt-1"
                    type="checkbox"
                    data-course-id="${escapeHtml(course._id)}"
                    aria-label="Select ${escapeHtml(course._id)}"
                >
                <div class="flex flex-col min-w-0">
                    <span class="text-[rgb(253,186,116)] font-mono font-extrabold text-sm">${escapeHtml(course._id)}</span>
                    <span class="text-white font-mono text-sm truncate">${escapeHtml(course.name)}</span>
                    <span class="text-gray-400 font-mono text-xs">${escapeHtml(dept)} &middot; ${course.credits} cr &middot; ${getDaysLabel(course.credits)} &middot; ${getTimeNote(course.credits)}</span>
                </div>
            </label>
        `;
    }).join('');
}
  
function renderScheduleGrid(schedule) {
    const days  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const hours = AVAILABLE_HOURS;
 
    const grid = {};
    days.forEach(d => { grid[d] = {}; });
    schedule.forEach(item => {
        item.days.forEach(d => { grid[d][item.hour] = item; });
    });
 
    const courseColorMap = {};
    schedule.forEach((item, i) => {
        courseColorMap[item.course._id] = PALETTE[i % PALETTE.length];
    });
 
    // Corner + day headers
    let html = `
        <div class="bg-gray-800 border-b border-r border-white py-2"></div>
        ${days.map((d, i) => `
            <div class="bg-gray-800 border-b border-white ${i < 4 ? 'border-r' : ''} py-2 text-center font-mono text-xs font-extrabold text-white uppercase tracking-widest">
                ${d}
            </div>
        `).join('')}
    `;
 
    // Time rows
    hours.forEach((h, hIdx) => {
        const isLastRow = hIdx === hours.length - 1;
        html += `
            <div class="bg-gray-800 border-r border-white ${isLastRow ? '' : 'border-b'} flex items-center justify-end pr-2 h-12 font-mono text-[10px] text-gray-300">
                ${formatHour(h)}
            </div>
        `;
        days.forEach((d, dIdx) => {
            const item      = grid[d][h];
            const isLastCol = dIdx === 4;
            const borderR   = isLastCol ? '' : 'border-r border-white';
            const borderB   = isLastRow ? '' : 'border-b border-white';
 
            if (item) {
                const color = courseColorMap[item.course._id];
                html += `
                    <div class="cell-accent flex items-center justify-center h-12 ${borderR} ${borderB} ${color.cellBg}"
                         style="--cell-color:${color.hex}">
                        <span class="font-mono text-[10px] font-extrabold ${color.label} px-1 text-center leading-tight">
                            ${escapeHtml(item.course._id)}
                        </span>
                    </div>
                `;
            } else {
                html += `<div class="h-12 ${borderR} ${borderB} bg-gray-800/40"></div>`;
            }
        });
    });
 
    scheduleGrid.innerHTML = html;
 
    // Summary cards
    scheduleCards.innerHTML = schedule.map((item, i) => {
        const color = PALETTE[i % PALETTE.length];
        return `
            <div class="flex flex-col bg-[rgb(31,41,55)] border border-white rounded-md p-2 text-left">
                <span class="font-mono font-extrabold text-sm ${color.label}">${escapeHtml(item.course._id)}</span>
                <span class="font-mono text-white text-xs truncate">${escapeHtml(item.course.name)}</span>
                <span class="font-mono text-gray-400 text-xs mt-1">${item.days.join(' / ')}</span>
                <span class="font-mono text-[rgb(253,186,116)] text-xs">${formatHour(item.hour)} &middot; ${item.course.credits} cr</span>
            </div>
        `;
    }).join('');
}
 
function buildSchedule() {
    const selected = state.courses.filter(c => state.selectedCourseIds.has(c._id));
 
    if (!selected.length) {
        setMessage('Select at least one course to build a schedule.', true);
        return;
    }
 
    const schedule = generateSchedule(selected);
 
    if (!schedule) {
        setMessage('Could not fit all courses without a time conflict. Try a different selection.', true);
        return;
    }
 
    state.generatedSchedule = schedule;
    setMessage('', false);
    renderScheduleGrid(schedule);
    scheduleSection.classList.remove('hidden');
    schedulePlaceholder.classList.add('hidden');
}
 
function generateSchedule(courses) {
    const mwfCourses  = courses.filter(c => !isTuTh(c.credits));
    const tuthCourses = courses.filter(c =>  isTuTh(c.credits));
 
    shuffle(mwfCourses);
    shuffle(tuthCourses);
 
    const usedMWF  = new Set();
    const usedTuTh = new Set();
    const schedule = [];
 
    for (const course of mwfCourses) {
        let hour;
        if (Number(course.credits) === 4) {
            hour = 9;
        } else {
            const available = AVAILABLE_HOURS.filter(h => !usedMWF.has(h));
            if (!available.length) return null;
            hour = available[Math.floor(Math.random() * available.length)];
        }
        if (usedMWF.has(hour)) return null;
        usedMWF.add(hour);
        schedule.push({ course, hour, days: DAYS_MWF });
    }
 
    for (const course of tuthCourses) {
        const available = AVAILABLE_HOURS.filter(h => !usedTuTh.has(h));
        if (!available.length) return null;
        const hour = available[Math.floor(Math.random() * available.length)];
        usedTuTh.add(hour);
        schedule.push({ course, hour, days: DAYS_TUTH });
    }
 
    return schedule;
}
  
function handleSelectionChange(event) {
    if (!event.target.classList.contains('course-checkbox')) return;
 
    const courseId = event.target.dataset.courseId;
    if (!courseId) return;
 
    if (event.target.checked) {
        if (state.selectedCourseIds.size >= MAX_SELECTION) {
            event.target.checked = false;
            setMessage(`You can only select up to ${MAX_SELECTION} courses.`, true);
            return;
        }
        state.selectedCourseIds.add(courseId);
    } else {
        state.selectedCourseIds.delete(courseId);
    }
 
    setMessage('', false);
    updateUI();
}
 
function clearSchedule() {
    state.selectedCourseIds.clear();
    state.generatedSchedule = null;
    courseList.querySelectorAll('.course-checkbox').forEach(cb => { cb.checked = false; });
    courseList.querySelectorAll('label').forEach(l => { l.style.opacity = ''; });
    scheduleSection.classList.add('hidden');
    schedulePlaceholder.classList.remove('hidden');
    setMessage('', false);
    updateUI();
}
  
function updateUI() {
    const count = state.selectedCourseIds.size;
    const hasCourses = state.courses.length > 0;
 
    buildButton.disabled = !hasCourses || count === 0;
    clearButton.disabled = count === 0;
 
    courseList.querySelectorAll('.course-checkbox').forEach(cb => {
        if (!cb.checked) {
            cb.disabled = count >= MAX_SELECTION;
            const label = cb.closest('label');
            if (label) label.style.opacity = count >= MAX_SELECTION ? '0.45' : '';
        } else {
            cb.disabled = false;
            const label = cb.closest('label');
            if (label) label.style.opacity = '';
        }
    });
}
 
function setMessage(message, isError) {
    scheduleMessage.textContent = message;
    scheduleMessage.className = isError
        ? 'font-mono text-sm text-yellow-300 min-h-5 my-1'
        : 'font-mono text-sm text-white min-h-5 my-1';
}
  
function isTuTh(credits) { return Number(credits) === 1; }
function getDaysLabel(credits) { return isTuTh(credits) ? 'Tue / Thu' : 'Mon / Wed / Fri'; }
function getTimeNote(credits)  { return Number(credits) === 4 ? 'Fixed 9:00 AM' : 'Random 9–2'; }
 
function formatHour(h) {
    if (h < 12)   return `${h}:00 AM`;
    if (h === 12) return `12:00 PM`;
    return `${h - 12}:00 PM`;
}
 
function getDepartmentValue(course) {
    const explicit = String(course?.department || '').trim();
    if (explicit) return explicit;
    const match = String(course?._id || '').trim().match(/^[A-Za-z]+/);
    return match ? match[0].toUpperCase() : '';
}
 
function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}
 
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}
 
async function readJsonResponse(response) {
    const ct = response.headers.get('content-type') || '';
    if (ct.includes('application/json')) return response.json();
    return { message: 'The server returned an error :(' };
}