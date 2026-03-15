const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./database');

// Routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const medicineRoutes = require('./routes/medicines');
const prescriptionRoutes = require('./routes/prescriptions');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const chatbotRoutes = require('./routes/chatbot');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes Middleware
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Root Route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to PharmaCare AI Node.js Backend 🚀' });
});

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
