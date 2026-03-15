const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { SECRET_KEY } = require('../middleware/auth');

// Register User
router.post('/register', async (req, res) => {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4();
        const userRole = role || 'customer';

        const sql = `INSERT INTO users (id, name, email, hashed_password, phone, role) VALUES (?, ?, ?, ?, ?, ?)`;
        const params = [userId, name, email, hashedPassword, phone, userRole];

        db.run(sql, params, function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'Email already exists.' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({
                id: userId,
                name,
                email,
                role: userRole,
                message: 'User registered successfully'
            });
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error during registration.' });
    }
});

// Login User
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    console.log(`Login attempt for: ${email}`);

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    const sql = `SELECT * FROM users WHERE email = ?`;
    db.get(sql, [email], async (err, user) => {
        if (err) {
            console.error('Database error during login:', err.message);
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            console.log(`Login failed: User not found for ${email}`);
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.hashed_password);
        console.log(`Password match for ${email}: ${isMatch}`);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    });
});

module.exports = router;
