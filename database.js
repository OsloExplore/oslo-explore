const sqlite3 = require('sqlite3').verbose();

// Create database connection
const db = new sqlite3.Database('./bookings.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        initializeTables();
    }
});

// Initialize database tables
function initializeTables() {
    // Create tours table
    db.run(`
        CREATE TABLE IF NOT EXISTS tours (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price INTEGER NOT NULL,
            image TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating tours table:', err.message);
        } else {
            console.log('Tours table ready.');
            // Insert sample tours if table is empty
            insertSampleTours();
        }
    });

    // Create bookings table
    db.run(`
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reference TEXT UNIQUE NOT NULL,
            tour_name TEXT NOT NULL,
            tour_price TEXT NOT NULL,
            tour_date TEXT NOT NULL,
            participants INTEGER NOT NULL,
            customer_name TEXT NOT NULL,
            customer_email TEXT NOT NULL,
            customer_phone TEXT NOT NULL,
            special_requests TEXT,
            status TEXT DEFAULT 'confirmed',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating bookings table:', err.message);
        } else {
            console.log('Bookings table ready.');
        }
    });
}

// Insert sample tours data
function insertSampleTours() {
    const tours = [
        {
            name: 'Oslo Fjord Cruise',
            description: 'Explore the stunning Oslo Fjord with breathtaking views and expert commentary.',
            price: 500,
            image: 'BIlder/Opera house from the front.jpg'
        },
        {
            name: 'Viking Museum Tour',
            description: 'Dive into Norway\'s Viking history at the Viking Ship Museum with a knowledgeable guide.',
            price: 400,
            image: 'BIlder/Oslo boat port west.jpg'
        },
        {
            name: 'Oslo City Walking Tour',
            description: 'Walk through the heart of Oslo and learn about its culture, history, and landmarks.',
            price: 350,
            image: 'BIlder/Oslo jernbanetorget restaurant.jpg'
        },
        {
            name: 'Royal Palace Tour',
            description: 'Visit the Royal Palace and learn about Norway\'s monarchy and royal history.',
            price: 375,
            image: 'BIlder/Oslo city banner.jpg'
        },
        {
            name: 'Fram Museum Tour',
            description: 'Explore polar exploration history at the Fram Museum, home to famous ships.',
            price: 450,
            image: 'BIlder/Frognerparken.jpg'
        },
        {
            name: 'Museum of Cultural History Tour',
            description: 'Discover Norway\'s cultural heritage through exhibits and outdoor museums.',
            price: 380,
            image: 'BIlder/Aker Brygge.jpg'
        }
    ];

    // Check if tours already exist
    db.get('SELECT COUNT(*) as count FROM tours', (err, row) => {
        if (err) {
            console.error('Error checking tours count:', err.message);
            return;
        }

        if (row.count === 0) {
            // Insert sample tours
            const stmt = db.prepare('INSERT INTO tours (name, description, price, image) VALUES (?, ?, ?, ?)');

            tours.forEach(tour => {
                stmt.run(tour.name, tour.description, tour.price, tour.image);
            });

            stmt.finalize();
            console.log('Sample tours inserted.');
        }
    });
}

// Generate unique booking reference
function generateBookingReference() {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 100000);
    return `OSLO-${year}-${randomNum.toString().padStart(5, '0')}`;
}

module.exports = {
    db,
    generateBookingReference
};
