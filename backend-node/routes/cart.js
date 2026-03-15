const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

// Get current user's cart
router.get('/', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const sql = `
        SELECT c.*, m.name, m.price, m.requires_prescription 
        FROM cart c 
        JOIN medicines m ON c.medicine_id = m.id 
        WHERE c.user_id = ?
    `;
    db.all(sql, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Add to cart
router.post('/add', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { medicine_id, quantity } = req.body;

    if (!medicine_id || !quantity) {
        return res.status(400).json({ error: 'Medicine ID and quantity are required.' });
    }

    // 1. Check if medicine exists and has stock
    db.get('SELECT * FROM medicines WHERE id = ?', [medicine_id], (err, medicine) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!medicine) return res.status(404).json({ error: 'Medicine not found in inventory.' });
        if (medicine.stock_quantity < quantity) return res.status(400).json({ error: 'Insufficient stock.' });

        // 2. Add to cart
        const sql = `INSERT INTO cart (user_id, medicine_id, quantity) VALUES (?, ?, ?)`;
        db.run(sql, [userId, medicine_id, quantity], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID, message: 'Added to cart' });
        });
    });
});

// Remove from cart
router.delete('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    db.run('DELETE FROM cart WHERE id = ? AND user_id = ?', [id, userId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Item removed from cart' });
    });
});

module.exports = router;
