const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

// 1. Check order status
router.get('/order-status', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const sql = `SELECT id, total_amount, order_status, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`;

    db.get(sql, [userId], (err, order) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!order) return res.json({ message: "You don't have any recent orders." });
        res.json(order);
    });
});

// 2. Check refill eligibility
router.get('/refill-status', authenticateToken, (req, res) => {
    const userId = req.user.id;
    // Check for medicines previously ordered that might need refills
    const sql = `
        SELECT m.name, m.id as medicine_id, o.id as last_order_id, r.refill_status
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN medicines m ON oi.medicine_id = m.id
        LEFT JOIN refills r ON (r.medicine_id = m.id AND r.user_id = ?)
        WHERE o.user_id = ?
        GROUP BY m.id
    `;

    db.all(sql, [userId, userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 3. Create refill request
router.post('/request-refill', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { medicine_id, last_order_id } = req.body;

    const sql = `INSERT INTO refills (user_id, medicine_id, last_order_id, refill_status) VALUES (?, ?, ?, 'requested')`;
    db.run(sql, [userId, medicine_id, last_order_id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Refill request submitted successfully." });
    });
});

// 4. Check medicine availability
router.get('/check-availability/:name', (req, res) => {
    const name = req.params.name;
    const sql = `SELECT name, stock_quantity, price FROM medicines WHERE name LIKE ?`;

    db.all(sql, [`%${name}%`], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (rows.length === 0) return res.json({ message: `I couldn't find ${name} in our inventory.` });
        res.json(rows);
    });
});

module.exports = router;
