const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const dbPath = path.resolve(__dirname, 'pharmacy.db');
const db = new sqlite3.Database(dbPath);

async function seed() {
    const hashedPassword = await bcrypt.hash('123456', 10);
    const userId = uuidv4();
    const adminId = uuidv4();

    db.serialize(() => {
        // Clear existing data (optional, but good for clean seed)
        // db.run("DELETE FROM users");
        // db.run("DELETE FROM medicines");

        // Seed Users
        const userSql = `INSERT OR IGNORE INTO users (id, name, email, hashed_password, role) VALUES (?, ?, ?, ?, ?)`;
        db.run(userSql, [userId, 'Sampada Raut', 'abc3@gmail.com', hashedPassword, 'customer']);
        db.run(userSql, [adminId, 'Admin User', 'admin@pharma.com', hashedPassword, 'admin']);

        // Seed Medicines
        const medSql = `INSERT OR IGNORE INTO medicines (name, brand, price, stock_quantity, category, dosage) VALUES (?, ?, ?, ?, ?, ?)`;
        const medicines = [
            ['Paracetamol', 'Panadol', 18.0, 100, 'Analgesic', '500mg'],
            ['Amoxicillin', 'Amoxil', 85.0, 50, 'Antibiotic', '250mg'],
            ['Cetrizine', 'Zyrtec', 32.0, 200, 'Antihistamine', '10mg'],
            ['Metformin', 'Glucophage', 48.0, 150, 'Antidiabetic', '500mg'],
            ['Azithromycin', 'Zithromax', 110.0, 30, 'Antibiotic', '500mg'],
            ['Vitamin C', 'Cebion', 65.0, 300, 'Supplement', '1000mg'],
            ['Salbutamol', 'Ventolin', 195.0, 20, 'Antiasthmatic', '100mcg']
        ];

        medicines.forEach(med => {
            db.run(medSql, med);
        });

        console.log('Database seeded successfully!');
    });
}

seed().catch(err => {
    console.error('Error seeding database:', err);
});
