document.getElementById('create-button').addEventListener('click', createAccount);

async function createAccount() {
    const username = document.getElementById('create-username').value;
    const password = document.getElementById('create-password').value;
    const accountType = document.querySelector('input[name="account-type"]:checked').value;

    if (!username || !password) {
        alert('Please fill in username/password fields');
        return;
    }

    try {
        let userBody = { username, password };

        if (accountType === 'admin') {
            code = document.getElementById('create-code').value;
            if (!code) {
                alert('Please enter the authorization code for admin accounts');
                return;
            }
            userBody.code = code;
        }

        const userRes = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userBody)
        });

        const userData = await userRes.json();
        if (!userRes.ok) {
            alert(userData.message);
            return;
        }

        if (accountType === 'student') {
            const firstName = document.getElementById('create-firstName').value;
            const lastName = document.getElementById('create-lastName').value;
            const studentId = document.getElementById('create-studentId').value;
            const email = document.getElementById('create-email').value;
            const major = document.getElementById('create-major').value;
            const track = document.getElementById('create-track').value;

            if (!firstName || !lastName || !studentId || !email || !major || !track) {
                alert('Please fill in all student fields');
                return;
            }

            const studentRes = await fetch('/api/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userData._id,
                    firstName,
                    lastName,
                    email,
                    studentId,
                    major,
                    track
                })
            });

            const studentData = await studentRes.json();
            if (!studentRes.ok) {
                alert('User created but failed to create student profile: ' + studentData.message);
                return;
            }
        }

        alert('Account created successfully! Please log in.');
        document.getElementById('create-form').classList.add('hidden');
        document.getElementById('create-username').value = '';
        document.getElementById('create-password').value = '';
        document.getElementById('create-firstName').value = '';
        document.getElementById('create-lastName').value = '';
        document.getElementById('create-studentId').value = '';
        document.getElementById('create-email').value = '';
        document.getElementById('create-major').value = '';
        document.getElementById('create-track').value = '';
        document.getElementById('create-code').value = '';
    }
    catch (err) {
        console.error('Account creation failed:', err);
        alert('Something went wrong. Please try again');
    }
}   