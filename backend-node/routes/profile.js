const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

// Get User Profile
router.get('/', authenticateToken, (req, res) => {
    const userId = req.user.id;

    const sql = `SELECT id, name, email, phone, date_of_birth, address, role, created_at FROM users WHERE id = ?`;
    db.get(sql, [userId], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        res.json(user);
    });
});

module.exports = router;
