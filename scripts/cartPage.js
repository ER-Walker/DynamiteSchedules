const cartList = document.getElementById('cart-list');
const commitCartButton = document.getElementById('commit-cart-button');
const removeCartButton = document.getElementById('remove-cart-button');
const cartMessage = document.getElementById('cart-message');
const state = {
    courses: [],
    selectedCourseIds: new Set()
};

document.addEventListener('DOMContentLoaded', initializeCartPage);

function initializeCartPage() {
    commitCartButton.addEventListener('click', commitCartToCurrentClasses);
    removeCartButton.addEventListener('click', removeSelectedCoursesFromCart);
    cartList.addEventListener('change', handleCartSelectionChange);
    cartList.addEventListener('click', handleCartCheckboxClick);
    loadCartPage();
}

async function loadCartPage() {
    try {
        const response = await fetch('/api/students/cart');
        const data = await readJsonResponse(response);

        if (!response.ok) {
            throw new Error(data.message || 'Failed to load cart.');
        }

        state.courses = data.courses || [];
        state.selectedCourseIds = new Set();
        renderCartList(state.courses);
        updateCommitButtonState();
    } catch (error) {
        cartList.innerHTML = '<div class="cart-card empty-state">Unable to load the cart right now.</div>';
        commitCartButton.disabled = true;
        removeCartButton.disabled = true;
        setCartMessage(error.message || 'Unable to load the cart right now.', true);
    }
}

function renderCartList(courses) {
    if (!courses.length) {
        cartList.innerHTML = '<div class="cart-card empty-state">There are no courses in the cart yet.</div>';
        commitCartButton.disabled = true;
        removeCartButton.disabled = true;
        return;
    }

    cartList.innerHTML = courses
        .map((course) => {
            const isChecked = state.selectedCourseIds.has(course._id) ? 'checked' : '';
            return `
                <details class="cart-card">
                    <summary>
                        <div class="cart-summary-row">
                            <input class="cart-checkbox" type="checkbox" data-course-id="${escapeHtml(course._id)}" aria-label="Select ${escapeHtml(course._id)}" ${isChecked}>
                            <span class="cart-summary-text">${escapeHtml(course._id)} - ${escapeHtml(course.name)}</span>
                        </div>
                    </summary>
                    <div class="cart-details">
                        <p class="cart-meta"><strong>Credits:</strong> ${course.credits}</p>
                        <p class="cart-meta"><strong>Department:</strong> ${escapeHtml(getDepartmentValue(course) || 'None')}</p>
                        <p class="cart-description"><strong>Description:</strong> ${escapeHtml(course.description || 'No description available.')}</p>
                    </div>
                </details>
            `;
        })
        .join('');
}

async function commitCartToCurrentClasses() {
    const selectedCourseIds = [...state.selectedCourseIds];

    if (!selectedCourseIds.length) {
        setCartMessage('Select at least one course from the cart.', true);
        return;
    }

    try {
        commitCartButton.disabled = true;
        removeCartButton.disabled = true;

        const response = await fetch('/api/students/cart/commit', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ courseIds: selectedCourseIds })
        });

        const data = await readJsonResponse(response);

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update current classes.');
        }

        setCartMessage(data.message || 'Current classes updated.', false);
        await loadCartPage();
    } catch (error) {
        setCartMessage(error.message, true);
        updateCommitButtonState();
    }
}

async function removeSelectedCoursesFromCart() {
    const selectedCourseIds = [...state.selectedCourseIds];

    if (!selectedCourseIds.length) {
        setCartMessage('Select at least one course from the cart.', true);
        return;
    }

    try {
        commitCartButton.disabled = true;
        removeCartButton.disabled = true;

        const response = await fetch('/api/students/cart/remove', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ courseIds: selectedCourseIds })
        });

        const data = await readJsonResponse(response);

        if (!response.ok) {
            throw new Error(data.message || 'Failed to remove the selected courses.');
        }

        setCartMessage(data.message || 'Selected courses removed from the cart.', false);
        await loadCartPage();
    } catch (error) {
        setCartMessage(error.message, true);
        updateCommitButtonState();
    }
}

function handleCartSelectionChange(event) {
    if (!event.target.classList.contains('cart-checkbox')) {
        return;
    }

    const courseId = event.target.dataset.courseId;

    if (!courseId) {
        return;
    }

    if (event.target.checked) {
        state.selectedCourseIds.add(courseId);
    } else {
        state.selectedCourseIds.delete(courseId);
    }

    setCartMessage('', false);
    updateCommitButtonState();
}

function handleCartCheckboxClick(event) {
    if (event.target.classList.contains('cart-checkbox')) {
        event.stopPropagation();
    }
}

function updateCommitButtonState() {
    const hasCartItems = state.courses.length > 0;
    const hasSelection = state.selectedCourseIds.size > 0;
    commitCartButton.disabled = !hasCartItems || !hasSelection;
    removeCartButton.disabled = !hasCartItems || !hasSelection;
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

async function readJsonResponse(response) {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
        return response.json();
    }

    return {
        message: 'The server returned an error :('
    };
}
