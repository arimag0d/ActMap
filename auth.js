document.getElementById('registerButton').addEventListener('click', function(event) {
    var email = document.getElementById('registerEmail').value;
    var password = document.getElementById('registerPassword').value;

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email, password: password })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Registration failed');
        }
        $('#loginModal').modal('hide');
    })
    .catch(error => {
        console.error('Registration error:', error);
    });
});


document.getElementById('loginButton').addEventListener('click', function(event) {
    var email = document.getElementById('loginEmail').value;
    var password = document.getElementById('loginPassword').value;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email, password: password })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Login failed');
        }
        $('#loginModal').modal('hide');
        return response.json();
    })
    .then(data => {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7);
        document.cookie = `authToken=${data.token}; expires=${expiryDate.toUTCString()}; path=/`;
        location.reload()
    })
    .catch(error => {
        console.error('Login error:', error);
    });
});
