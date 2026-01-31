// Smooth scrolling for navigation links
document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Header scroll effect
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Modal functionality for tour details
const modal = document.createElement('div');
modal.id = 'tour-modal';
modal.innerHTML = `
    <div class="modal-content">
        <span class="close">&times;</span>
        <div class="booking-header">
            <h2 id="modal-title"></h2>
            <div class="tour-summary">
                <img id="modal-image" src="" alt="">
                <div class="tour-info">
                    <p id="modal-description"></p>
                    <span id="modal-price" class="price-tag"></span>
                </div>
            </div>
        </div>
        <div class="progress-bar">
            <div class="step active" data-step="1">Date & Guests</div>
            <div class="step" data-step="2">Your Details</div>
        </div>
        <form id="booking-form">
            <div id="step-1" class="step-content">
                <div class="form-section">
                    <label for="tour-date">Select Date</label>
                    <input type="text" id="tour-date" placeholder="Choose your date" readonly required>
                </div>
                <div class="form-section">
                    <label for="participants">Number of Participants</label>
                    <input type="number" id="participants" min="1" max="10" required>
                </div>
                <div class="form-actions">
                    <button type="button" id="next-step" class="btn primary">Continue</button>
                </div>
            </div>
            <div id="step-2" class="step-content" style="display: none;">
                <div class="form-section">
                    <label for="customer-name">Full Name</label>
                    <input type="text" id="customer-name" required>
                </div>
                <div class="form-section">
                    <label for="customer-email">Email Address</label>
                    <input type="email" id="customer-email" required>
                </div>
                <div class="form-section">
                    <label for="customer-phone">Phone Number</label>
                    <input type="tel" id="customer-phone" required>
                </div>
                <div class="form-section">
                    <label for="special-requests">Special Requests (Optional)</label>
                    <textarea id="special-requests" placeholder="Any special requirements or notes..."></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" id="prev-step" class="btn secondary">Back</button>
                    <button type="submit" class="btn primary">Confirm Booking</button>
                </div>
            </div>
        </form>
    </div>
`;
document.body.appendChild(modal);

const modalContent = modal.querySelector('.modal-content');
const closeBtn = modal.querySelector('.close');

closeBtn.onclick = function() {
    modal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Add event listeners to tour cards
document.querySelectorAll('.tour-card .btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        const card = this.closest('.tour-card');
        const title = card.querySelector('h3').textContent;
        const image = card.querySelector('img').src;
        const description = card.querySelector('p').textContent;
        const price = card.querySelector('.price').textContent;

        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-image').src = image;
        document.getElementById('modal-description').textContent = description;
        document.getElementById('modal-price').textContent = price;

        // Reset form
        document.getElementById('booking-form').reset();
        document.getElementById('step-1').style.display = 'block';
        document.getElementById('step-2').style.display = 'none';

        // Initialize Flatpickr for date input
        flatpickr("#tour-date", {
            dateFormat: "Y-m-d",
            minDate: "today",
            theme: "dark"
        });

        modal.style.display = 'block';
    });
});



// Search functionality for tours
const tourSearch = document.getElementById('tour-search');
if (tourSearch) {
    tourSearch.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        filterTours();
    });
}

// Price filter functionality
const priceFilter = document.getElementById('price-filter');
if (priceFilter) {
    priceFilter.addEventListener('change', function() {
        filterTours();
    });
}

// Combined filter function
function filterTours() {
    const searchTerm = (tourSearch ? tourSearch.value.toLowerCase() : '');
    const priceRange = (priceFilter ? priceFilter.value : '');
    const tourCards = document.querySelectorAll('.tour-card');

    tourCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();
        const priceText = card.querySelector('.price').textContent;
        const price = parseInt(priceText.replace(/[^\d]/g, ''));

        // Search filter
        const matchesSearch = !searchTerm || title.includes(searchTerm) || description.includes(searchTerm);

        // Price filter
        let matchesPrice = true;
        if (priceRange === 'low') {
            matchesPrice = price < 400;
        } else if (priceRange === 'medium') {
            matchesPrice = price >= 400 && price <= 450;
        } else if (priceRange === 'high') {
            matchesPrice = price > 450;
        }

        // Show/hide based on filters
        if (matchesSearch && matchesPrice) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Contact form submission
const contactForm = document.querySelector('.contact-form form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Show loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        // Simulate form submission (replace with actual API call)
        setTimeout(() => {
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.textContent = 'Thank you for your message! We\'ll get back to you soon.';
            successMessage.style.cssText = `
                color: #3b82f6;
                background: rgba(59, 130, 246, 0.1);
                padding: 15px;
                border-radius: 10px;
                margin-top: 20px;
                border: 1px solid rgba(59, 130, 246, 0.2);
            `;

            this.appendChild(successMessage);

            // Reset form
            this.reset();

            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;

            // Remove success message after 5 seconds
            setTimeout(() => {
                successMessage.remove();
            }, 5000);
        }, 1000);
    });
}

// Booking system with backend API
async function saveBooking(bookingData) {
    try {
        const response = await fetch('http://localhost:3001/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create booking');
        }

        const result = await response.json();
        return result.booking;
    } catch (error) {
        console.error('Error saving booking:', error);
        throw error;
    }
}

// Update modal book button functionality
document.querySelectorAll('.tour-card .btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        const card = this.closest('.tour-card');
        const title = card.querySelector('h3').textContent;
        const image = card.querySelector('img').src;
        const description = card.querySelector('p').textContent;
        const price = card.querySelector('.price').textContent;

        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-image').src = image;
        document.getElementById('modal-description').textContent = description;
        document.getElementById('modal-price').textContent = price;

        // Reset form
        document.getElementById('booking-form').reset();
        document.getElementById('step-1').style.display = 'block';
        document.getElementById('step-2').style.display = 'none';

        modal.style.display = 'block';
    });
});

// Form step navigation
document.getElementById('next-step').addEventListener('click', function() {
    const date = document.getElementById('tour-date').value;
    const participants = document.getElementById('participants').value;
    if (date && participants) {
        document.getElementById('step-1').style.display = 'none';
        document.getElementById('step-2').style.display = 'block';
    } else {
        alert('Please select a date and number of participants.');
    }
});

document.getElementById('prev-step').addEventListener('click', function() {
    document.getElementById('step-2').style.display = 'none';
    document.getElementById('step-1').style.display = 'block';
});

// Booking form submission
document.getElementById('booking-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    // Show loading state
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Processing...';
    submitBtn.disabled = true;

    try {
        const bookingData = {
            tourName: document.getElementById('modal-title').textContent,
            tourPrice: document.getElementById('modal-price').textContent,
            tourDate: document.getElementById('tour-date').value,
            participants: parseInt(document.getElementById('participants').value),
            customerName: document.getElementById('customer-name').value,
            customerEmail: document.getElementById('customer-email').value,
            customerPhone: document.getElementById('customer-phone').value,
            specialRequests: document.getElementById('special-requests').value || ''
        };

        const booking = await saveBooking(bookingData);
        alert(`Booking confirmed for ${bookingData.tourName} on ${bookingData.tourDate}! Your booking reference is ${booking.reference}. Check your email for confirmation.`);
        console.log('Email confirmation sent to:', bookingData.customerEmail, 'with details:', booking);

        // Reset form and close modal
        this.reset();
        modal.style.display = 'none';
    } catch (error) {
        alert('Failed to create booking. Please try again.');
        console.error('Booking error:', error);
    } finally {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Modal styles (added dynamically)
const modalStyles = `
    #tour-modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
    }
    .modal-content {
        background: #1e293b;
        border: 1px solid rgba(59, 130, 246, 0.2);
        margin: 5% auto;
        padding: 0;
        border-radius: 16px;
        width: 90%;
        max-width: 800px;
        position: relative;
        color: #e2e8f0;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        overflow: hidden;
    }
    .close {
        position: absolute;
        top: 20px;
        right: 20px;
        color: #aaa;
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
        z-index: 10;
    }
    .close:hover {
        color: #fff;
    }
    .booking-header {
        padding: 30px 30px 20px;
        background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
    }
    .booking-header h2 {
        margin: 0 0 20px 0;
        font-size: 28px;
        font-weight: 700;
        color: #fff;
    }
    .tour-summary {
        display: flex;
        gap: 20px;
        align-items: center;
    }
    .tour-summary img {
        width: 120px;
        height: 80px;
        object-fit: cover;
        border-radius: 8px;
        flex-shrink: 0;
    }
    .tour-info p {
        margin: 0 0 8px 0;
        font-size: 16px;
        color: #cbd5e1;
    }
    .price-tag {
        font-size: 20px;
        font-weight: 700;
        color: #3b82f6;
    }
    .progress-bar {
        display: flex;
        background: #0f172a;
        padding: 0 30px;
    }
    .progress-bar .step {
        flex: 1;
        padding: 15px 0;
        text-align: center;
        font-weight: 600;
        color: #64748b;
        position: relative;
    }
    .progress-bar .step.active {
        color: #3b82f6;
    }
    .progress-bar .step:not(:last-child)::after {
        content: '';
        position: absolute;
        top: 50%;
        right: 0;
        width: 1px;
        height: 20px;
        background: #374151;
        transform: translateY(-50%);
    }
    #booking-form {
        padding: 30px;
    }
    .form-section {
        margin-bottom: 25px;
    }
    .form-section label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: #e2e8f0;
        font-size: 14px;
    }
    .form-section input, .form-section textarea {
        width: 100%;
        padding: 12px 16px;
        border: 2px solid #374151;
        border-radius: 8px;
        background: #0f172a;
        color: #e2e8f0;
        font-size: 16px;
        transition: border-color 0.3s ease;
    }
    .form-section input:focus, .form-section textarea:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    .form-section textarea {
        height: 100px;
        resize: vertical;
        font-family: inherit;
    }
    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 30px;
    }
    .btn {
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 120px;
    }
    .btn.primary {
        background: #3b82f6;
        color: white;
    }
    .btn.primary:hover {
        background: #2563eb;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
    .btn.secondary {
        background: transparent;
        color: #cbd5e1;
        border: 2px solid #374151;
    }
    .btn.secondary:hover {
        background: #374151;
        color: #e2e8f0;
    }
    @media (max-width: 768px) {
        .modal-content {
            width: 95%;
            margin: 2% auto;
        }
        .booking-header {
            padding: 20px;
        }
        .tour-summary {
            flex-direction: column;
            gap: 15px;
        }
        .tour-summary img {
            width: 100%;
            height: 120px;
        }
        #booking-form {
            padding: 20px;
        }
        .progress-bar {
            padding: 0 20px;
        }
    }
`;

const style = document.createElement('style');
style.textContent = modalStyles;
document.head.appendChild(style);
