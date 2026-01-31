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
    try {
        const tours = db.data.tours || [];
        res.json(tours);
    } catch (error) {
        console.error('Error fetching tours:', error.message);
        return res.status(500).json({ error: 'Failed to fetch tours' });
    }
});

// Get all bookings (for admin purposes)
app.get('/api/bookings', (req, res) => {
    try {
        const bookings = db.data.bookings || [];
        res.json(bookings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (error) {
        console.error('Error fetching bookings:', error.message);
        return res.status(500).json({ error: 'Failed to fetch bookings' });
    }
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

    try {
        // Create booking object
        const booking = {
            id: Date.now(), // Simple ID generation
            reference,
            tour_name: tourName,
            tour_price: tourPrice,
            tour_date: tourDate,
            participants,
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone,
            special_requests: specialRequests || '',
            status: 'confirmed',
            created_at: new Date().toISOString()
        };

        // Add to database
        db.data.bookings.push(booking);
        await db.write();

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
                id: booking.id,
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
    } catch (error) {
        console.error('Error creating booking:', error.message);
        return res.status(500).json({ error: 'Failed to create booking' });
    }
});

// Helper function to check if reference exists
function isReferenceExists(reference) {
    return new Promise((resolve) => {
        const exists = db.data.bookings.some(booking => booking.reference === reference);
        resolve(exists);
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
    process.exit(0);
});
