require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { db, generateBookingReference } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// Email transporter setup
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// API Routes

// Get all tours
app.get('/api/tours', (req, res) => {
    db.all('SELECT * FROM tours ORDER BY id', (err, rows) => {
        if (err) {
            console.error('Error fetching tours:', err.message);
            return res.status(500).json({ error: 'Failed to fetch tours' });
        }
        res.json(rows);
    });
});

// Get all bookings (for admin purposes)
app.get('/api/bookings', (req, res) => {
    db.all('SELECT * FROM bookings ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            console.error('Error fetching bookings:', err.message);
            return res.status(500).json({ error: 'Failed to fetch bookings' });
        }
        res.json(rows);
    });
});

// Create a new booking
app.post('/api/bookings', async (req, res) => {
    const {
        tourName,
        tourPrice,
        tourDate,
        participants,
        customerName,
        customerEmail,
        customerPhone,
        specialRequests
    } = req.body;

    // Validation
    if (!tourName || !tourDate || !participants || !customerName || !customerEmail || !customerPhone) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (participants < 1 || participants > 10) {
        return res.status(400).json({ error: 'Participants must be between 1 and 10' });
    }

    // Generate unique reference
    let reference;
    let attempts = 0;
    do {
        reference = generateBookingReference();
        attempts++;
        if (attempts > 10) {
            return res.status(500).json({ error: 'Failed to generate unique reference' });
        }
    } while (await isReferenceExists(reference));

    // Insert booking
    const sql = `
        INSERT INTO bookings (reference, tour_name, tour_price, tour_date, participants, customer_name, customer_email, customer_phone, special_requests)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [reference, tourName, tourPrice, tourDate, participants, customerName, customerEmail, customerPhone, specialRequests || ''], function(err) {
        if (err) {
            console.error('Error creating booking:', err.message);
            return res.status(500).json({ error: 'Failed to create booking' });
        }

        const bookingId = this.lastID;

        // Send confirmation email
        sendConfirmationEmail({
            reference,
            tourName,
            tourPrice,
            tourDate,
            participants,
            customerName,
            customerEmail,
            customerPhone,
            specialRequests
        }).catch(emailErr => {
            console.error('Error sending confirmation email:', emailErr);
            // Don't fail the booking if email fails
        });

        res.status(201).json({
            success: true,
            booking: {
                id: bookingId,
                reference,
                tourName,
                tourPrice,
                tourDate,
                participants,
                customerName,
                customerEmail,
                customerPhone,
                specialRequests,
                status: 'confirmed'
            }
        });
    });
});

// Helper function to check if reference exists
function isReferenceExists(reference) {
    return new Promise((resolve, reject) => {
        db.get('SELECT id FROM bookings WHERE reference = ?', [reference], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(!!row);
            }
        });
    });
}

// Send confirmation email
async function sendConfirmationEmail(booking) {
    const mailOptions = {
        from: process.env.SMTP_USER,
        to: booking.customerEmail,
        subject: `Booking Confirmation - ${booking.reference}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #3b82f6;">Booking Confirmation</h2>
                <p>Dear ${booking.customerName},</p>
                <p>Thank you for booking with Oslo Explore! Your booking has been confirmed.</p>

                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3>Booking Details:</h3>
                    <p><strong>Reference:</strong> ${booking.reference}</p>
                    <p><strong>Tour:</strong> ${booking.tourName}</p>
                    <p><strong>Date:</strong> ${booking.tourDate}</p>
                    <p><strong>Participants:</strong> ${booking.participants}</p>
                    <p><strong>Price:</strong> ${booking.tourPrice}</p>
                    <p><strong>Phone:</strong> ${booking.customerPhone}</p>
                    ${booking.specialRequests ? `<p><strong>Special Requests:</strong> ${booking.specialRequests}</p>` : ''}
                </div>

                <p>We look forward to seeing you in Oslo!</p>
                <p>Best regards,<br>Oslo Explore Team</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Confirmation email sent to:', booking.customerEmail);
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error;
    }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
});
