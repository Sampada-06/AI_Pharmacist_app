const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Get all medicines (Public)
router.get('/', (req, res) => {
    const sql = `SELECT * FROM medicines`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Add medicine (Admin/Pharmacist)
router.post('/', authenticateToken, authorizeRoles('admin', 'pharmacist'), (req, res) => {
    const {
        name, generic_name, brand, description, category, dosage,
        price, stock_quantity, minimum_stock_alert, expiry_date, batch_number, requires_prescription
    } = req.body;

    if (!name || price === undefined) {
        return res.status(400).json({ error: 'Name and price are required.' });
    }

    const sql = `INSERT INTO medicines (
        name, generic_name, brand, description, category, dosage, 
        price, stock_quantity, minimum_stock_alert, expiry_date, batch_number, requires_prescription
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
        name, generic_name, brand, description, category, dosage,
        price, stock_quantity || 0, minimum_stock_alert || 10, expiry_date, batch_number, requires_prescription ? 1 : 0
    ];

    db.run(sql, params, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, message: 'Medicine added successfully' });
    });
});

// Update stock (Admin/Pharmacist)
router.put('/:id/stock', authenticateToken, authorizeRoles('admin', 'pharmacist'), (req, res) => {
    const { stock_quantity } = req.body;
    const { id } = req.params;

    if (stock_quantity === undefined) {
        return res.status(400).json({ error: 'Stock quantity is required.' });
    }

    const sql = `UPDATE medicines SET stock_quantity = ? WHERE id = ?`;
    db.run(sql, [stock_quantity, id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Medicine not found.' });
        }
        res.json({ message: 'Stock updated successfully' });
    });
});

// Delete medicine (Admin)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
    const { id } = req.params;

    const sql = `DELETE FROM medicines WHERE id = ?`;
    db.run(sql, id, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Medicine not found.' });
        }
        res.json({ message: 'Medicine deleted successfully' });
    });
});

// Get low stock items (Admin/Pharmacist)
router.get('/low-stock', authenticateToken, authorizeRoles('admin', 'pharmacist'), (req, res) => {
    const sql = `SELECT * FROM medicines WHERE stock_quantity < minimum_stock_alert`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

module.exports = router;
