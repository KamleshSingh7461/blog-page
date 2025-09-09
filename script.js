// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = target.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Header scroll effect
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
    }
});

// Newsletter form handling
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        
        if (email) {
            // Here you would typically send the email to your backend
            // For now, we'll just show a success message
            alert('Thank you for subscribing! We\'ll keep you updated with the latest content.');
            this.reset();
        }
    });
}

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.post-card, .tutorial-card, .about-content, .newsletter-content');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
});

// Code animation typing effect
function typeCode() {
    const codeLines = document.querySelectorAll('.code-line');
    let delay = 0;
    
    codeLines.forEach((line, index) => {
        setTimeout(() => {
            line.style.opacity = '1';
            line.style.transform = 'translateY(0)';
        }, delay);
        delay += 500;
    });
}

// Initialize code animation when hero section is visible
const heroObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            typeCode();
            heroObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', function() {
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        // Set initial state for code lines
        const codeLines = document.querySelectorAll('.code-line');
        codeLines.forEach(line => {
            line.style.opacity = '0';
            line.style.transform = 'translateY(20px)';
            line.style.transition = 'all 0.6s ease';
        });
        
        heroObserver.observe(heroSection);
    }
});

// Lazy loading for images
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => {
            imageObserver.observe(img);
        });
    }
});

// Reading progress indicator
function createReadingProgress() {
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, #2563eb, #10b981);
        z-index: 9999;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', function() {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

// Initialize reading progress
document.addEventListener('DOMContentLoaded', createReadingProgress);

// Search functionality (basic implementation)
function createSearch() {
    const searchHTML = `
        <div class="search-overlay" id="searchOverlay">
            <div class="search-container">
                <input type="text" id="searchInput" placeholder="Search articles..." autocomplete="off">
                <button id="closeSearch" class="close-search">&times;</button>
                <div id="searchResults" class="search-results"></div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', searchHTML);
    
    // Add search button to header
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
        const searchItem = document.createElement('li');
        searchItem.className = 'nav-item';
        searchItem.innerHTML = '<a href="#" class="nav-link" id="searchToggle">Search</a>';
        navMenu.appendChild(searchItem);
    }
    
    // Search functionality
    const searchToggle = document.getElementById('searchToggle');
    const searchOverlay = document.getElementById('searchOverlay');
    const closeSearch = document.getElementById('closeSearch');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    
    if (searchToggle) {
        searchToggle.addEventListener('click', function(e) {
            e.preventDefault();
            searchOverlay.style.display = 'flex';
            searchInput.focus();
        });
    }
    
    if (closeSearch) {
        closeSearch.addEventListener('click', function() {
            searchOverlay.style.display = 'none';
            searchInput.value = '';
            searchResults.innerHTML = '';
        });
    }
    
    // Close search on overlay click
    if (searchOverlay) {
        searchOverlay.addEventListener('click', function(e) {
            if (e.target === searchOverlay) {
                searchOverlay.style.display = 'none';
                searchInput.value = '';
                searchResults.innerHTML = '';
            }
        });
    }
    
    // Search input handling
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            if (query.length > 2) {
                // Simple search implementation
                const articles = document.querySelectorAll('.post-title a');
                const results = Array.from(articles).filter(article => 
                    article.textContent.toLowerCase().includes(query)
                );
                
                searchResults.innerHTML = results.map(article => 
                    `<div class="search-result-item">
                        <a href="${article.href}">${article.textContent}</a>
                    </div>`
                ).join('');
            } else {
                searchResults.innerHTML = '';
            }
        });
    }
}

// Add search styles
const searchStyles = `
    .search-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: none;
        justify-content: center;
        align-items: flex-start;
        padding-top: 100px;
        z-index: 10000;
    }
    
    .search-container {
        background: white;
        padding: 2rem;
        border-radius: 12px;
        width: 90%;
        max-width: 600px;
        position: relative;
    }
    
    .close-search {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #6b7280;
    }
    
    #searchInput {
        width: 100%;
        padding: 1rem;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        font-size: 1rem;
        margin-bottom: 1rem;
    }
    
    #searchInput:focus {
        outline: none;
        border-color: #2563eb;
    }
    
    .search-results {
        max-height: 300px;
        overflow-y: auto;
    }
    
    .search-result-item {
        padding: 0.75rem 0;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .search-result-item:last-child {
        border-bottom: none;
    }
    
    .search-result-item a {
        color: #374151;
        text-decoration: none;
        font-weight: 500;
    }
    
    .search-result-item a:hover {
        color: #2563eb;
    }
`;

// Add search styles to head
document.addEventListener('DOMContentLoaded', function() {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = searchStyles;
    document.head.appendChild(styleSheet);
    
    // Initialize search
    createSearch();
});

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to scroll events
const debouncedScrollHandler = debounce(function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
    }
}, 10);

window.addEventListener('scroll', debouncedScrollHandler);

// Dark Mode Toggle
document.addEventListener('DOMContentLoaded', function() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;
    
    // Check for saved dark mode preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
    }
    
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            body.classList.toggle('dark-mode');
            
            // Save preference
            const isDark = body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            
            // Animate toggle
            this.style.transform = 'translateY(-50%) scale(1.2)';
            setTimeout(() => {
                this.style.transform = 'translateY(-50%) scale(1)';
            }, 200);
        });
    }
});

// Sticky Sidebar Ad
window.addEventListener('scroll', function() {
    const stickyAd = document.querySelector('.sticky-ad-sidebar');
    if (stickyAd) {
        if (window.scrollY > 500) {
            stickyAd.style.display = 'block';
        } else {
            stickyAd.style.display = 'none';
        }
    }
});

// Console welcome message
console.log(`
🚀 Welcome to CodeCrafter Live!
📧 Contact: hello@codecrafter.live
🌐 Website: https://codecrafter.live
💻 Built with ❤️ for developers
`);

// Service Worker registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed');
            });
    });
}
