const PALETTE = [
    { label: 'text-yellow-300',  cellBg: 'bg-yellow-300/20',  hex: '#fde047' },
    { label: 'text-sky-300',     cellBg: 'bg-sky-300/20',     hex: '#7dd3fc' },
    { label: 'text-emerald-300', cellBg: 'bg-emerald-300/20', hex: '#6ee7b7' },
    { label: 'text-pink-300',    cellBg: 'bg-pink-300/20',    hex: '#f9a8d4' },
    { label: 'text-orange-300',  cellBg: 'bg-orange-300/20',  hex: '#fdba74' },
];
 
const HOURS = [9, 10, 11, 12, 13, 14];
const fmtHour = h => h < 12 ? `${h}:00 AM` : h === 12 ? '12:00 PM' : `${h-12}:00 PM`;
const esc = v => String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const shuffle = a => { for (let i = a.length-1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } };
 
const state = { courses: [], selected: new Set() };
 
const $ = id => document.getElementById(id);
const courseList = $('course-list'), buildBtn = $('build-schedule-button'),
      clearBtn   = $('clear-schedule-button'), schedSection = $('schedule-section'),
      placeholder = $('schedule-placeholder'),
      cards = $('schedule-cards'), msg = $('schedule-message');
 
document.addEventListener('DOMContentLoaded', async () => {
    buildBtn.addEventListener('click', buildSchedule);
    clearBtn.addEventListener('click', clearSchedule);
    $('regenerate-button').addEventListener('click', buildSchedule);
    courseList.addEventListener('change', e => {
        if (!e.target.classList.contains('course-checkbox')) return;
        const id = e.target.dataset.courseId;
        if (e.target.checked) {
            if (state.selected.size >= 5) { e.target.checked = false; setMsg('You can only select up to 5 courses.', true); return; }
            state.selected.add(id);
        } else {
            state.selected.delete(id);
        }
        setMsg('', false);
        updateUI();
    });
 
    try {
        const res  = await fetch('/api/students/currentClasses');
        const ct   = res.headers.get('content-type') || '';
        const data = ct.includes('application/json') ? await res.json() : { message: 'Unexpected server response.' };
        if (!res.ok) throw new Error(data.message || 'Failed to load current classes.');
        state.courses = (data.currentClasses || []).slice(0, 5);
        courseList.innerHTML = state.courses.length
            ? state.courses.map(c => {
                const dept = String(c?.department||'').trim() || String(c?._id||'').match(/^[A-Za-z]+/)?.[0]?.toUpperCase() || 'N/A';
                const days = Number(c.credits)===1 ? 'Tue/Thu' : 'MWF';
                const time = Number(c.credits)===4 ? 'Fixed 9AM' : 'Rand 9–2';
                return `<label class="flex flex-row items-start gap-2 bg-[rgb(31,41,55)] border border-white rounded-md px-3 py-2 cursor-pointer text-left w-full" data-course-id="${esc(c._id)}">
                    <input class="course-checkbox mt-1" type="checkbox" data-course-id="${esc(c._id)}" aria-label="Select ${esc(c._id)}">
                    <div class="flex flex-col min-w-0">
                        <span class="text-[rgb(253,186,116)] font-mono font-extrabold text-sm">${esc(c._id)}</span>
                        <span class="text-white font-mono text-sm truncate">${esc(c.name)}</span>
                        <span class="text-gray-400 font-mono text-xs">${esc(dept)} &middot; ${c.credits}cr &middot; ${days} &middot; ${time}</span>
                    </div>
                </label>`;
            }).join('')
            : `<p class="text-white font-mono text-sm">No current classes enrolled.</p>`;
        updateUI();
    } catch (err) {
        courseList.innerHTML = `<p class="text-white font-mono text-sm">Unable to load current classes right now.</p>`;
        buildBtn.disabled = clearBtn.disabled = true;
        setMsg(err.message, true);
    }
});
 
function buildSchedule() {
    const selected = state.courses.filter(c => state.selected.has(c._id));
    if (!selected.length) { setMsg('Select at least one course.', true); return; }
 
    const mwf = selected.filter(c => Number(c.credits) !== 1);
    const tuth = selected.filter(c => Number(c.credits) === 1);
    shuffle(mwf); shuffle(tuth);
 
    const usedMWF = new Set(), usedTuTh = new Set(), schedule = [];
    const conflict = () => { setMsg('Could not fit all courses without a time conflict.', true); };
 
    for (const c of mwf) {
        const avail = HOURS.filter(h => !usedMWF.has(h));
        const hour  = Number(c.credits) === 4 ? 9 : avail[Math.floor(Math.random()*avail.length)];
        if (!hour || usedMWF.has(hour)) { conflict(); return; }
        usedMWF.add(hour);
        schedule.push({ course: c, hour, days: ['Mon','Wed','Fri'] });
    }
    for (const c of tuth) {
        const avail = HOURS.filter(h => !usedTuTh.has(h));
        if (!avail.length) { conflict(); return; }
        const hour = avail[Math.floor(Math.random()*avail.length)];
        usedTuTh.add(hour);
        schedule.push({ course: c, hour, days: ['Tue','Thu'] });
    }
 
    cards.innerHTML = schedule.map((item, i) => {
        const cl = PALETTE[i % PALETTE.length];
        return `<div class="flex flex-col bg-[rgb(31,41,55)] border border-white rounded-md p-2 text-left">
            <span class="font-mono font-extrabold text-sm ${cl.label}">${esc(item.course._id)}</span>
            <span class="font-mono text-white text-xs truncate">${esc(item.course.name)}</span>
            <span class="font-mono text-gray-400 text-xs mt-1">${item.days.join(' / ')}</span>
            <span class="font-mono text-[rgb(253,186,116)] text-xs">${fmtHour(item.hour)} &middot; ${item.course.credits}cr</span>
        </div>`;
    }).join('');
 
    setMsg('', false);
    schedSection.classList.remove('hidden');
    placeholder.classList.add('hidden');
}
 
function clearSchedule() {
    state.selected.clear();
    courseList.querySelectorAll('.course-checkbox').forEach(cb => { cb.checked = false; });
    courseList.querySelectorAll('label').forEach(l => { l.style.opacity = ''; });
    schedSection.classList.add('hidden');
    placeholder.classList.remove('hidden');
    setMsg('', false);
    updateUI();
}
 
function updateUI() {
    const count = state.selected.size;
    buildBtn.disabled = !state.courses.length || count === 0;
    clearBtn.disabled = count === 0;
    courseList.querySelectorAll('.course-checkbox').forEach(cb => {
        const atMax = count >= 5;
        cb.disabled = !cb.checked && atMax;
        cb.closest('label').style.opacity = !cb.checked && atMax ? '0.45' : '';
    });
}
 
function setMsg(message, isError) {
    msg.textContent = message;
    msg.className = `font-mono text-sm min-h-5 my-1 ${isError ? 'text-yellow-300' : 'text-white'}`;
}