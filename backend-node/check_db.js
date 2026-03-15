const db = require('./database');

db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, rows) => {
    if (err) {
        console.error('Error fetching tables:', err.message);
    } else {
        console.log('Tables in database:');
        rows.forEach(row => console.log(`- ${row.name}`));
    }
    process.exit(0);
});
