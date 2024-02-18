const { v4: uuidv4 } = require('uuid');

function generateAuthToken() {
    return uuidv4();;
}


const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 5500;

const db = new sqlite3.Database('users.db');


db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    authToken TEXT,
    email TEXT,
    password TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS markers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    lat REAL,
    lng REAL,
    category TEXT,
    description TEXT,
    date TEXT,
    time TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
)`);


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


app.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, row) => {
        if (row) {
            const token = generateAuthToken();
            db.run('UPDATE users SET authToken = ? WHERE id = ?', [token, row.id], (err) => {
                if (err) {
                    res.status(500).send('Error updating authentication token in database');
                } else {
                    res.cookie('authToken', token);
                    res.status(200).json({ message: 'Login successful', showModal: true, token: token });
                }
            });
        } else {
            res.status(401).send('Invalid credentials');
        }
    });
});


app.post('/register', (req, res) => {
    const { email, password } = req.body;
    db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, password], (err) => {
        if (err) {
            res.status(500).send('Error inserting into database');
        } else {
            res.send('Registration successful');
        }
    });
});


app.post('/save-marker', (req, res) => {
    console.log(req.body)
    const { cookie, lat, lng, category, description, date, time} = req.body;
    const authToken = cookie
        .split('; ')
        .find(row => row.startsWith('authToken='))
        ?.split('=')[1];

    db.get('SELECT * FROM users WHERE authToken = ?', [authToken], (err, user) => {
        if (user) {
            const userId = user.id;

            db.run('INSERT INTO markers (userId, lat, lng, category, description, date, time) VALUES (?, ?, ?, ?, ?, ?, ?)', [userId, lat, lng, category, description, date, time], (err) => {
                if (err) {
                    res.status(500).send('Помилка при збереженні маркера');
                } else {
                    res.status(200).send('Маркер збережено успішно');
                }
            });
        } else {
            res.status(401).send('Користувач не авторизований');
        }
    });
});

app.get('/markers', (req, res) => {
    db.all('SELECT * FROM markers', (err, rows) => {
        if (err) {
            res.status(500).send('Error retrieving markers from database');
        } else {
            res.status(200).json(rows);
        }
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});