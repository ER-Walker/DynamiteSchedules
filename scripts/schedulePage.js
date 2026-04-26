const searchFilter = document.getElementById('search-filter');
const departmentFilter = document.getElementById('department-filter');
const tagFilter = document.getElementById('tag-filter');
const creditsFilter = document.getElementById('credits-filter');
const prerequisiteFilter = document.getElementById('prerequisite-filter');
const courseSelect = document.getElementById('course-select');
const resultsSummary = document.getElementById('results-summary');
const coursePreview = document.getElementById('course-preview');
const addToCartButton = document.getElementById('add-to-cart-button');
const cartMessage = document.getElementById('cart-message');

const state = {
    courses: [],
    filteredCourses: []
};

document.addEventListener('DOMContentLoaded', initializeSchedulePage);

async function initializeSchedulePage() {
    registerEvents();

    try {
        const response = await fetch('/api/courses');

        if (!response.ok) {
            throw new Error('Failed to load courses.');
        }

        state.courses = await response.json();
        populateFilterOptions();
        applyFilters();
    } catch (error) {
        resultsSummary.textContent = 'Unable to load courses right now.';
        coursePreview.className = 'course-preview empty-state';
        coursePreview.textContent = error.message;
    }
}

function registerEvents() {
    searchFilter.addEventListener('input', applyFilters);
    departmentFilter.addEventListener('change', handleDepartmentChange);
    tagFilter.addEventListener('change', applyFilters);
    creditsFilter.addEventListener('change', applyFilters);
    prerequisiteFilter.addEventListener('change', applyFilters);
    courseSelect.addEventListener('change', renderSelectedCourse);
    addToCartButton.addEventListener('click', addSelectedCourseToCart);
}

function populateFilterOptions() {
    const departments = new Set();
    const credits = new Set();

    state.courses.forEach((course) => {
        const department = getDepartmentValue(course);
        if (department) {
            departments.add(department);
        }
        credits.add(String(course.credits));
    });

    [...departments].sort().forEach((department) => {
        departmentFilter.add(new Option(department, department));
    });

    [...credits]
        .sort((a, b) => Number(a) - Number(b))
        .forEach((creditValue) => {
            creditsFilter.add(new Option(`${creditValue} credits`, creditValue));
        });

    populateRequirementOptions();
}

function handleDepartmentChange() {
    populateRequirementOptions();
    applyFilters();
}

function populateRequirementOptions() {
    const selectedDepartment = departmentFilter.value;
    const tags = new Set();
    const previousSelection = tagFilter.value;

    state.courses.forEach((course) => {
        const matchesDepartment =
            !selectedDepartment || getDepartmentValue(course) === selectedDepartment;

        if (!matchesDepartment) {
            return;
        }

        (course.requirementTag || []).forEach((tag) => {
            const normalizedTag = String(tag || '').trim();

            if (normalizedTag) {
                tags.add(normalizedTag);
            }
        });
    });

    tagFilter.innerHTML = '';
    tagFilter.add(new Option('All requirements', ''));

    [...tags].sort().forEach((tag) => {
        tagFilter.add(new Option(tag, tag));
    });

    if ([...tags].includes(previousSelection)) {
        tagFilter.value = previousSelection;
    }
}

function applyFilters() {
    const searchValue = searchFilter.value.trim().toLowerCase();
    const selectedDepartment = departmentFilter.value;
    const selectedTag = tagFilter.value;
    const selectedCredits = creditsFilter.value;
    const prerequisiteValue = prerequisiteFilter.value;
    const previousSelection = courseSelect.value;

    state.filteredCourses = state.courses.filter((course) => {
        const matchesSearch =
            !searchValue ||
            course._id.toLowerCase().includes(searchValue) ||
            course.name.toLowerCase().includes(searchValue);
        const matchesDepartment =
            !selectedDepartment || getDepartmentValue(course) === selectedDepartment;
        const matchesTag =
            !selectedTag || (course.requirementTag || []).includes(selectedTag);
        const matchesCredits =
            !selectedCredits || String(course.credits) === selectedCredits;
        const hasPrerequisites = Array.isArray(course.prerequisite) && course.prerequisite.length > 0;
        const matchesPrerequisites =
            prerequisiteValue === 'all' ||
            (prerequisiteValue === 'yes' && hasPrerequisites) ||
            (prerequisiteValue === 'no' && !hasPrerequisites);

        return matchesSearch && matchesDepartment && matchesTag && matchesCredits && matchesPrerequisites;
    });

    renderCourseDropdown(previousSelection);
    renderSelectedCourse();
}

function renderCourseDropdown(previousSelection) {
    courseSelect.innerHTML = '';
    courseSelect.add(new Option('Choose a course', ''));

    state.filteredCourses.forEach((course) => {
        courseSelect.add(new Option(`${course._id} - ${course.name}`, course._id));
    });

    if (state.filteredCourses.some((course) => course._id === previousSelection)) {
        courseSelect.value = previousSelection;
    }

    resultsSummary.textContent = `${state.filteredCourses.length} course(s) match your filters.`;
}

function renderSelectedCourse() {
    const selectedCourseId = courseSelect.value;

    setCartMessage('', false);

    if (!selectedCourseId) {
        coursePreview.className = 'course-preview empty-state';
        coursePreview.textContent = 'Choose a course from the dropdown to see the details here.';
        addToCartButton.disabled = true;
        return;
    }

    const course = state.courses.find((item) => item._id === selectedCourseId);

    if (!course) {
        coursePreview.className = 'course-preview empty-state';
        coursePreview.textContent = 'The selected course could not be found.';
        addToCartButton.disabled = true;
        return;
    }

    coursePreview.className = 'course-preview';
    addToCartButton.disabled = false;
    coursePreview.innerHTML = `
        <h3>${escapeHtml(course._id)} - ${escapeHtml(course.name)}</h3>
        <p><strong>Credits:</strong> ${course.credits}</p>
        <p><strong>Department:</strong> ${escapeHtml(getDepartmentValue(course) || 'None')}</p>
        <p><strong>Description:</strong> ${escapeHtml(course.description || 'No description available.')}</p>
        <p><strong>Prerequisites:</strong> ${escapeHtml(formatList(course.prerequisite))}</p>
        <p><strong>Corequisites:</strong> ${escapeHtml(formatList(course.corequisite))}</p>
    `;
}

async function addSelectedCourseToCart() {
    const selectedCourseId = courseSelect.value;

    if (!selectedCourseId) {
        setCartMessage('Choose a course before adding it to the cart.', true);
        return;
    }

    try {
        const response = await fetch('/api/students/cart', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ courseId: selectedCourseId })
        });
        const contentType = response.headers.get('content-type') || '';
        const data = contentType.includes('application/json')
            ? await response.json()
            : { message: 'The server returned an unexpected response. Please log in again.' };

        if (!response.ok) {
            throw new Error(data.message || 'Failed to add the course to the cart.');
        }

        setCartMessage(data.message || 'Course added to cart.', false);
    } catch (error) {
        setCartMessage(error.message, true);
    }
}

function formatList(values) {
    return Array.isArray(values) && values.length ? values.join(', ') : 'None';
}

function getDepartmentValue(course) {
    const explicitDepartment = String(course?.department || '').trim();

    if (explicitDepartment) {
        return explicitDepartment;
    }

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

function setCartMessage(message, isError) {
    cartMessage.textContent = message;
    cartMessage.className = isError ? 'cart-message error' : 'cart-message';
}
