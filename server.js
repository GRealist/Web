// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const db = new sqlite3.Database('./db.sqlite');


app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'main.html'));
});

// Register user
app.post('/register', (req, res) => {
  const { username, email, phone, password } = req.body;
  const role = 'user';

  const query = `INSERT INTO users (username, email, phone, password, role) VALUES (?, ?, ?, ?, ?)`;
  db.run(query, [username, email, phone, password, role], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.status(201).json({ id: this.lastID });
  });
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
})

// Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username = ? AND password = ?`, [username, password], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(401).json({ error: 'Invalid credentials' });
    res.json(row);
  });
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
})

// Profile Screen
app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profile.html'));
})

// Leaderboard
app.get('/leaderboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'leaderboard.html'));
})

// Contact
app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contact.html'));
})

// Get all users (admin only - frontend should restrict this)
app.get('/users', (req, res) => {
  db.all(`SELECT id, username, email, phone, role FROM users`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Update user role
app.patch('/users/:id/role', (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  db.run(`UPDATE users SET role = ? WHERE id = ?`, [role, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Role updated' });
  });
});

// Add activity for a user
app.post('/activities/:username', (req, res) => {
  const { username } = req.params;
  const { description, date } = req.body;

  db.get(`SELECT id FROM users WHERE username = ?`, [username], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'User not found' });

    db.run(`INSERT INTO activities (user_id, description, date) VALUES (?, ?, ?)`,
      [row.id, description, date],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ activityId: this.lastID });
      }
    );
  });
});

// Get user activities
app.get('/activities/:username', (req, res) => {
  const { username } = req.params;
  db.get(`SELECT id FROM users WHERE username = ?`, [username], (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'User not found' });

    db.all(`SELECT * FROM activities WHERE user_id = ?`, [user.id], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
