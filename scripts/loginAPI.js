const button = document.getElementById('login-button');

button.addEventListener('click', login);

async function login() {
    console.log('Login button clicked');
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    console.log("Username: " + username);
    console.log("Password: " + password);

    if (!username || !password) {
        console.log('Login failed: Missing username or password');
        alert('Please enter both username and password.');
        return;
    }

    try {
        const res = await fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        let data;
        try {
            data = await res.json();
        }
        catch {
            alert('Server error. Please try again');
            return;
        }

        if (res.ok) {
            window.location.href = '/index';
        }
        else {
            alert(data.message);
        }
        
    } catch (err) {
        console.error('Login failed:', err);
        alert('Something went wrong. Please try again.');
    }
}