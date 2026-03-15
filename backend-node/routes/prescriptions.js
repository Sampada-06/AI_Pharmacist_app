const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Get all prescriptions for a user
router.get('/my', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const sql = `SELECT * FROM prescriptions WHERE user_id = ?`;
    db.all(sql, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Upload a prescription (Customer)
router.post('/upload', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { doctor_name, hospital_name, prescription_file_url } = req.body;

    if (!prescription_file_url) {
        return res.status(400).json({ error: 'Prescription file URL is required.' });
    }

    const sql = `INSERT INTO prescriptions (user_id, doctor_name, hospital_name, prescription_file_url, status) VALUES (?, ?, ?, ?, 'pending')`;
    db.run(sql, [userId, doctor_name, hospital_name, prescription_file_url], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, message: 'Prescription uploaded successfully' });
    });
});

// Get pending prescriptions (Pharmacist/Admin)
router.get('/pending', authenticateToken, authorizeRoles('pharmacist', 'admin'), (req, res) => {
    const sql = `SELECT p.*, u.name as customer_name FROM prescriptions p JOIN users u ON p.user_id = u.id WHERE p.status = 'pending'`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Approve/Reject prescription (Pharmacist/Admin)
router.put('/:id/status', authenticateToken, authorizeRoles('pharmacist', 'admin'), (req, res) => {
    const { status } = req.body; // 'approved' or 'rejected'
    const { id } = req.params;
    const reviewerId = req.user.id;

    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Use approved or rejected.' });
    }

    const sql = `UPDATE prescriptions SET status = ?, reviewed_by = ? WHERE id = ?`;
    db.run(sql, [status, reviewerId, id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Prescription not found.' });
        }
        res.json({ message: `Prescription ${status} successfully` });
    });
});

module.exports = router;
