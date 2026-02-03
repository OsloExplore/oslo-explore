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

