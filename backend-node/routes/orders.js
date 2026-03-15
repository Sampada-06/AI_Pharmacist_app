const express = require('express');
const router = express.Router();
const db = require('../database');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');

// Create Order (Checkout)
router.post('/checkout', authenticateToken, (req, res) => {
    const userId = req.user.id;

    // 1. Get user's cart items
    const getCartSql = `
        SELECT c.*, m.name, m.price, m.requires_prescription, m.stock_quantity 
        FROM cart c 
        JOIN medicines m ON c.medicine_id = m.id 
        WHERE c.user_id = ?
    `;

    db.all(getCartSql, [userId], (err, cartItems) => {
        if (err) return res.status(500).json({ error: err.message });
        if (cartItems.length === 0) return res.status(400).json({ error: 'Cart is empty.' });

        // 2. Validate prescription requirements (Simplified for now)
        const rxItems = cartItems.filter(item => item.requires_prescription);
        if (rxItems.length > 0) {
            // In a real app, we'd check the 'prescriptions' table for an 'approved' entry
            // For now, we'll assume the user has validated this in the UI
            console.log('Validating prescriptions for:', rxItems.map(i => i.name));
        }

        // 3. Calculate total and check stock
        let totalAmount = 0;
        for (const item of cartItems) {
            if (item.stock_quantity < item.quantity) {
                return res.status(400).json({ error: `Not enough stock for ${item.name}` });
            }
            totalAmount += item.price * item.quantity;
        }

        const orderId = uuidv4();

        // 4. Start Transaction-like sequence
        db.serialize(() => {
            // A. Create Order
            db.run(`INSERT INTO orders (id, user_id, total_amount, payment_status, order_status) VALUES (?, ?, ?, 'pending', 'processing')`,
                [orderId, userId, totalAmount]);

            // B. Create Order Items & Update Stock
            cartItems.forEach(item => {
                db.run(`INSERT INTO order_items (order_id, medicine_id, quantity, price) VALUES (?, ?, ?, ?)`,
                    [orderId, item.medicine_id, item.quantity, item.price]);

                db.run(`UPDATE medicines SET stock_quantity = stock_quantity - ? WHERE id = ?`,
                    [item.quantity, item.medicine_id]);
            });

            // C. Clear Cart
            db.run(`DELETE FROM cart WHERE user_id = ?`, [userId], function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.status(201).json({ orderId, message: 'Order placed successfully' });
            });
        });
    });
});

// Get My Orders
router.get('/my', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const sql = `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`;
    db.all(sql, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

module.exports = router;
