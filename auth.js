// Function to toggle between login and register forms
function toggleForm(formType) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginBtn = document.querySelector('.toggle-btn:nth-child(1)');
    const registerBtn = document.querySelector('.toggle-btn:nth-child(2)');

    if (formType === 'login') {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        loginBtn.classList.add('active');
        registerBtn.classList.remove('active');
    } else {
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
        registerBtn.classList.add('active');
        loginBtn.classList.remove('active');
    }
}

// Function to load users from localStorage
function loadUsers() {
    const users = localStorage.getItem('users');
    if (!users) {
        // Add default user if no users exist
        const defaultUsers = [{
            name: "Darshan",
            email: "darshan@gmail.com",
            password: btoa("darshan@123"), // Basic encoding
            createdAt: new Date().toISOString()
        }];
        localStorage.setItem('users', JSON.stringify(defaultUsers));
        return defaultUsers;
    }
    return JSON.parse(users);
}

// Function to save users to localStorage
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Handle Register Form Submission
function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    const users = loadUsers();
    
    // Check if user already exists
    if (users.some(user => user.email === email)) {
        alert('User already exists with this email!');
        return;
    }

    // Add new user
    users.push({
        name,
        email,
        password: btoa(password), // Basic encoding (not secure for production)
        createdAt: new Date().toISOString()
    });

    saveUsers(users);
    alert('Registration successful! Please login.');
    toggleForm('login');
    event.target.reset();
}

// Handle Login Form Submission
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const users = loadUsers();

    console.log('Attempting login with:', { email, password });
    console.log('Available users:', users);

    const user = users.find(u => u.email === email && btoa(password) === u.password);

    if (user) {
        console.log('Login successful for user:', user.name);
        // Save login state
        localStorage.setItem('currentUser', JSON.stringify({
            name: user.name,
            email: user.email,
            loginTime: new Date().toISOString()
        }));

        // Try to redirect to jobs page
        try {
            console.log('Attempting to redirect to jobs.html');
            window.location.replace('jobs.html');
        } catch (error) {
            console.error('Redirect error:', error);
            alert('Error redirecting to jobs page. Please try again.');
        }
    } else {
        console.log('Login failed - Invalid credentials');
        alert('Invalid email or password!');
    }
}

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = localStorage.getItem('currentUser');
    console.log('Checking current user:', currentUser);
    if (currentUser && window.location.pathname.endsWith('index.html')) {
        console.log('User already logged in, redirecting to jobs.html');
        window.location.replace('jobs.html');
    }
}); 