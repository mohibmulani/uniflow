// UniFlow Website JavaScript

document.addEventListener('DOMContentLoaded', function () {
    // ============================================
    // ANNOUNCEMENT BANNER INITIALIZATION
    // ============================================
    initAnnounceBanner();

    // Animated Counter Implementation
    const counters = document.querySelectorAll('.counter');
    const speed = 200;

    function animateCounter(counter) {
        const target = +counter.getAttribute('data-target');
        let count = 0;
        const inc = target / speed;

        function updateCount() {
            if (count < target) {
                count += inc;
                counter.innerText = Math.ceil(count);
                setTimeout(updateCount, 1);
            } else {
                counter.innerText = target;
            }
        }

        updateCount();
    }

    // Intersection Observer for counter animation
    const countersObserverOptions = {
        threshold: 0.5
    };

    const countersObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counters = entry.target.querySelectorAll('.counter');
                counters.forEach(counter => animateCounter(counter));
                countersObserver.unobserve(entry.target);
            }
        });
    }, countersObserverOptions);

    // Observe stats section
    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) {
        countersObserver.observe(statsSection);
    }

    // Mobile Navigation
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navbar = document.getElementById('navbar');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function () {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : 'auto';
        });

        // Close mobile menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        });
    }

    // Navbar scroll effect
    // Navbar scroll effect
    window.addEventListener('scroll', function () {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Add background to navbar on scroll
        if (scrollTop > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(12px)';
            navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.backdropFilter = 'blur(12px)';
            navbar.style.boxShadow = 'var(--shadow-sm)';
        }
    });

    // Fix smooth scrolling for all navigation links
    function smoothScrollTo(targetId) {
        const target = document.getElementById(targetId);
        if (target) {
            const offsetTop = target.offsetTop - 80; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    // Handle all navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            smoothScrollTo(targetId);
        });
    });

    // Fix CTA buttons functionality
    const ctaButtons = document.querySelectorAll('.nav-cta');
    ctaButtons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            smoothScrollTo('contact');
        });
    });

    // Fix hero buttons
    const heroButtons = document.querySelectorAll('.hero-buttons .btn');
    heroButtons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const btnText = this.textContent.toLowerCase();
            if (btnText.includes('counseling') || btnText.includes('consultation')) {
                smoothScrollTo('contact');
            } else if (btnText.includes('services')) {
                smoothScrollTo('services');
            }
        });
    });

    // Contact Form Handling with improved validation
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Validate form before submission
            if (!validateForm()) {
                return;
            }

            // Get form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);

            // Show loading state
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;

            // Submit form to Google Sheets
            submitFormToGoogleSheets(data)
                .then(response => {
                    showMessage('Thank you! Your application has been submitted successfully. We will contact you soon.', 'success');
                    contactForm.reset();
                })
                .catch(error => {
                    showMessage('Sorry, there was an error submitting your form. Please try again or contact us directly at +91-9666963756.', 'error');
                    console.error('Form submission error:', error);
                })
                .finally(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                });
        });
    }

    // Animate elements on scroll
    const animationObserverOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const animationObserver = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');
            }
        });
    }, animationObserverOptions);

    // Observe all cards and sections
    const elementsToAnimate = document.querySelectorAll('.service-card, .destination-card, .testimonial-card, .journey-card, .about-content');
    elementsToAnimate.forEach(el => {
        animationObserver.observe(el);
    });

    // Add click handlers for journey cards (analytics / tracking placeholder)
    const journeyCards = document.querySelectorAll('.journey-card');
    journeyCards.forEach(card => {
        card.addEventListener('click', function () {
            const title = card.querySelector('h3') ? card.querySelector('h3').textContent : 'Journey Step';
            console.log(`Journey card clicked: ${title}`);
        });
    });

    // Initialize scroll animations
    initScrollAnimations();

    // Improved focus management for accessibility (moved here from bottom of file)
    const focusableElements = document.querySelectorAll(
        'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    focusableElements.forEach(el => {
        el.addEventListener('focus', function () {
            this.style.outline = '2px solid var(--color-primary)';
            this.style.outlineOffset = '2px';
        });
        el.addEventListener('blur', function () {
            this.style.outline = '';
        });
    });

    // University Search Functionality
    const universitySearchForm = document.getElementById('universitySearchForm');
    const searchResults = document.getElementById('searchResults');

    // Sample university data - In production, this would come from your backend
    const universities = [
        {
            name: "California State University",
            country: "USA",
            courses: ["masters", "bachelors"],
            fields: ["engineering", "it", "business"],
            budget: "20-25",
            logo: "./images/universities/csu-logo.png",
            location: "California, USA",
            ranking: "#120 in US News",
            tuitionFee: "₹22 Lakhs/year",
            acceptance: "75%"
        },
        {
            name: "University of Manchester",
            country: "UK",
            courses: ["masters", "phd"],
            fields: ["engineering", "business", "medicine"],
            budget: "25+",
            logo: "./images/universities/manchester-logo.png",
            location: "Manchester, UK",
            ranking: "#27 in QS World Rankings",
            tuitionFee: "₹26 Lakhs/year",
            acceptance: "65%"
        },
        // Add more universities as needed
    ];

    if (universitySearchForm) {
        universitySearchForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const country = document.getElementById('country').value;
            const course = document.getElementById('course').value;
            const field = document.getElementById('field').value;
            const budget = document.getElementById('budget').value;

            // Filter universities based on criteria
            const filteredUniversities = universities.filter(uni => {
                return (!country || uni.country === country) &&
                    (!course || uni.courses.includes(course)) &&
                    (!field || uni.fields.includes(field)) &&
                    (!budget || uni.budget === budget);
            });

            // Display results
            displaySearchResults(filteredUniversities);
        });
    }

    function displaySearchResults(results) {
        if (!searchResults) return;

        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="no-results">
                    <p>No universities found matching your criteria. Please try different filters or contact us for more options.</p>
                </div>
            `;
            return;
        }

        searchResults.innerHTML = results.map(uni => `
            <div class="university-card">
                <img src="${uni.logo}" alt="${uni.name} logo" class="university-logo" loading="lazy">
                <h3 class="university-name">${uni.name}</h3>
                <div class="university-location">
                    <i class="fas fa-map-marker-alt"></i> ${uni.location}
                </div>
                <div class="university-details">
                    <p><i class="fas fa-trophy"></i> ${uni.ranking}</p>
                    <p><i class="fas fa-money-bill-wave"></i> ${uni.tuitionFee}</p>
                    <p><i class="fas fa-check-circle"></i> ${uni.acceptance} Acceptance Rate</p>
                </div>
                <div class="university-cta">
                    <button class="btn btn--outline" onclick="window.location.href='#contact'">Enquire Now</button>
                    <button class="btn btn--primary" onclick="window.location.href='#contact'">Apply Now</button>
                </div>
            </div>
        `).join('');
    }

    // FAQ Section Interactivity (robust with ARIA + keyboard support)
    const faqContainer = document.querySelector('.faq-content');
    if (faqContainer) {
        // Initialize aria attributes
        faqContainer.querySelectorAll('.faq-question').forEach(btn => {
            btn.setAttribute('role', 'button');
            btn.setAttribute('aria-expanded', 'false');
            const answer = btn.nextElementSibling;
            if (answer && answer.classList.contains('faq-answer')) {
                const id = answer.id || ('faq-answer-' + Math.random().toString(36).substr(2, 9));
                answer.id = id;
                btn.setAttribute('aria-controls', id);
            }
            // Ensure focusable and clickable
            if (!btn.hasAttribute('tabindex')) btn.setAttribute('tabindex', '0');
        });

        // Use event delegation for clicks and keypresses
        faqContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.faq-question');
            if (!btn) return;
            toggleFaq(btn);
        });

        faqContainer.addEventListener('keydown', (e) => {
            const key = e.key;
            if (key !== 'Enter' && key !== ' ') return;
            const btn = e.target.closest('.faq-question');
            if (!btn) return;
            e.preventDefault();
            toggleFaq(btn);
        });
    }

    function toggleFaq(button) {
        const answer = button.nextElementSibling;
        if (!answer || !answer.classList.contains('faq-answer')) return;

        console.log('Toggling FAQ for:', button.textContent.trim());

        const parentCategory = button.closest('.faq-category');
        // Close other open answers in same category
        if (parentCategory) {
            parentCategory.querySelectorAll('.faq-question.active').forEach(openBtn => {
                if (openBtn !== button) {
                    openBtn.classList.remove('active');
                    openBtn.setAttribute('aria-expanded', 'false');
                    const otherAnswer = openBtn.nextElementSibling;
                    if (otherAnswer && otherAnswer.classList.contains('faq-answer')) {
                        otherAnswer.classList.remove('show');
                    }
                }
            });
        }

        const isOpen = button.classList.toggle('active');
        button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        if (isOpen) {
            answer.classList.add('show');
        } else {
            answer.classList.remove('show');
        }
    }

    // Fallback: attach direct listeners to each faq-question (in case delegation misses)
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFaq(btn);
        });
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleFaq(btn);
            }
        });
    });
});

// Improved form validation
function validateForm() {
    const form = document.getElementById('contactForm');
    const name = form.querySelector('#name').value.trim();
    const email = form.querySelector('#email').value.trim();
    const phone = form.querySelector('#phone').value.trim();
    const destination = form.querySelector('#destination').value;
    const course = form.querySelector('#course').value.trim();

    let isValid = true;

    // Clear previous errors
    clearFormErrors();

    if (!name) {
        showFieldError(form.querySelector('#name'), 'Name is required');
        isValid = false;
    }

    if (!email) {
        showFieldError(form.querySelector('#email'), 'Email is required');
        isValid = false;
    } else if (!validateEmail(email)) {
        showFieldError(form.querySelector('#email'), 'Please enter a valid email address');
        isValid = false;
    }

    if (!phone) {
        showFieldError(form.querySelector('#phone'), 'Phone number is required');
        isValid = false;
    } else if (!validatePhone(phone)) {
        showFieldError(form.querySelector('#phone'), 'Please enter a valid phone number');
        isValid = false;
    }

    if (!destination) {
        showFieldError(form.querySelector('#destination'), 'Please select a destination');
        isValid = false;
    }

    if (!course) {
        showFieldError(form.querySelector('#course'), 'Course interest is required');
        isValid = false;
    }

    return isValid;
}

function clearFormErrors() {
    const errors = document.querySelectorAll('.field-error');
    errors.forEach(error => error.remove());

    const fields = document.querySelectorAll('.form-control');
    fields.forEach(field => {
        field.style.borderColor = 'var(--color-border)';
    });
}

function showMessage(message, type) {
    // Remove any existing messages
    const existingMessages = document.querySelectorAll('.form-success, .form-error');
    existingMessages.forEach(msg => msg.remove());

    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'success' ? 'form-success' : 'form-error';
    messageDiv.textContent = message;

    // Insert before the form
    const contactForm = document.getElementById('contactForm');
    contactForm.parentNode.insertBefore(messageDiv, contactForm);

    // Scroll to message
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 10000);
}

// Google Sheets Integration Function
async function submitFormToGoogleSheets(data) {
    /*
    DETAILED STEPS TO CONNECT FORM TO GOOGLE SHEETS:
    
    1. CREATE GOOGLE SHEET:
       - Go to https://sheets.google.com
       - Click "+" to create new sheet
       - Name it "UniFlow - Contact Forms"
       - In row 1, add these headers: Name | Email | Phone | Destination | Course | Message | Timestamp
    
    2. SET UP GOOGLE APPS SCRIPT:
       - In your sheet, click Extensions > Apps Script
       - Delete default code and paste this:
       
       function doPost(e) {
         try {
           var sheet = SpreadsheetApp.getActiveSheet();
           var data = JSON.parse(e.postData.contents);
           
           sheet.appendRow([
             data.name || '',
             data.email || '',
             data.phone || '',
             data.destination || '',
             data.course || '',
             data.message || '',
             new Date()
           ]);
           
           return ContentService
             .createTextOutput(JSON.stringify({result: 'success', message: 'Data saved successfully'}))
             .setMimeType(ContentService.MimeType.JSON);
         } catch (error) {
           return ContentService
             .createTextOutput(JSON.stringify({result: 'error', message: error.toString()}))
             .setMimeType(ContentService.MimeType.JSON);
         }
       }
    
    3. DEPLOY THE SCRIPT:
       - Click "Deploy" > "New deployment" 
       - Type: Web app
       - Execute as: Me
       - Who has access: Anyone
       - Click "Deploy"
       - Copy the Web App URL
    
    4. UPDATE THIS CODE:
       - Replace the URL below with your actual deployment URL
       - Test the form
    
    5. OPTIONAL - ADD EMAIL NOTIFICATIONS:
       Add this to your Apps Script after the sheet.appendRow line:
       
       // Send email notification
       GmailApp.sendEmail(
         'info@evoverseas.com',
         'New Contact Form Submission - UniFlow',
         `New inquiry received:\n\nName: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\nDestination: ${data.destination}\nCourse: ${data.course}\nMessage: ${data.message}`
       );
    */

    // Replace this with your actual Google Apps Script URL
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwRtK3z-qp2sRCztkPbkG8ixpITP7tom6Ffq6ct8K7jZ0hQ5o8g03BJeJSzMb7y_W8NMw/exec';

    // For demo purposes, simulate successful submission
    // In production, uncomment the fetch request and use your actual URL
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('Form data that would be submitted:', data);
            resolve({ result: 'success' });

            // Uncomment this for actual Google Sheets integration:

            fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: JSON.stringify(data)
            })
                .then(response => response.json())
                .then(result => {
                    if (result.result === 'success') {
                        resolve(result);
                    } else {
                        reject(new Error(result.message || 'Form submission failed'));
                    }
                })
                .catch(error => {
                    console.error('Submission error:', error);
                    reject(error);
                });

        }, 1000);
    });
}

// Improved email validation (less strict)
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Phone validation (accepts various formats)
function validatePhone(phone) {
    const cleaned = phone.replace(/\s|-|\(|\)/g, '');
    const phoneRegex = /^[\+]?[0-9]{10,15}$/;
    return phoneRegex.test(cleaned);
}

function showFieldError(field, message) {
    field.style.borderColor = 'var(--color-error)';

    // Remove existing error
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }

    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.color = 'var(--color-error)';
    errorDiv.style.fontSize = 'var(--font-size-sm)';
    errorDiv.style.marginTop = 'var(--space-4)';
    errorDiv.textContent = message;

    field.parentNode.appendChild(errorDiv);
}

// Add scroll-based animations
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.service-card, .destination-card, .testimonial-card, .journey-card');

    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        animationObserver.observe(el);
    });
}

// Add keyboard navigation support
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');

        if (navMenu && navMenu.classList.contains('active')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }
});

// Utility function for scrolling
window.scrollToSection = function (sectionId) {
    const target = document.getElementById(sectionId);
    if (target) {
        const offsetTop = target.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
};

// Enhanced Analytics Tracking (REPLACE existing trackEvent function)
function trackEvent(eventName, eventData = {}) {
    console.log(`Analytics Event: ${eventName}`, eventData);

    // Send to Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
            event_category: eventData.page_section || 'general',
            event_label: eventData.button_text || eventData.service_name || eventData.destination || '',
            value: eventData.value || 1
        });
    }
}

// Add form submission tracking (ADD this to your form submit handler)
document.getElementById('contactForm').addEventListener('submit', function () {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'form_submit', {
            event_category: 'engagement',
            event_label: 'contact_form',
            value: 1
        });
    }
});


function getPageSection(element) {
    const section = element.closest('section');
    return section ? section.id || section.className : 'unknown';
}

// ...existing code...

// ============================================
// ANNOUNCEMENT BANNER FUNCTIONS
// ============================================
function initAnnounceBanner() {
    const banner = document.getElementById('announceBanner');
    if (!banner) return;

    // Check if banner is enabled via data attribute
    const isEnabled = banner.getAttribute('data-enabled') === 'true';

    // Check if user has closed the banner in this session
    const isClosed = sessionStorage.getItem('bannerClosed') === 'true';

    if (isEnabled && !isClosed) {
        banner.classList.remove('hidden');
        document.body.classList.add('banner-visible');
        // Set CSS variable for banner height
        updateBannerHeight();
        window.addEventListener('resize', updateBannerHeight);
    } else {
        banner.classList.add('hidden');
        document.body.classList.remove('banner-visible');
        document.body.style.setProperty('--banner-height', '0px');
    }
}

function updateBannerHeight() {
    const banner = document.getElementById('announceBanner') || document.getElementById('rebrandBanner');
    if (banner && !banner.classList.contains('hidden')) {
        const height = banner.offsetHeight;
        document.body.style.setProperty('--banner-height', height + 'px');
    }
}

// Close banner function (called from HTML onclick)
window.closeBanner = function () {
    const banner = document.getElementById('announceBanner');
    if (banner) {
        banner.classList.add('hidden');
        document.body.classList.remove('banner-visible');
        document.body.style.setProperty('--banner-height', '0px');
        // Remember that user closed the banner for this session
        sessionStorage.setItem('bannerClosed', 'true');
    }
};

// ============================================
// CLOSE ANNOUNCE BANNER (for onclick handler)
// ============================================
window.closeAnnounceBanner = function () {
    const banner = document.getElementById('announceBanner');
    if (banner) {
        banner.classList.add('hidden');
        document.body.classList.remove('banner-visible');
        document.body.style.setProperty('--banner-height', '0px');
        // Remember that user closed the banner for this session
        sessionStorage.setItem('bannerClosed', 'true');
    }
};

// Initialize announce banner on page load (auto-enable for this banner)
document.addEventListener('DOMContentLoaded', function () {
    const banner = document.getElementById('announceBanner');
    if (banner) {
        // Check if user has closed the banner in this session
        const isClosed = sessionStorage.getItem('bannerClosed') === 'true';

        if (!isClosed) {
            banner.classList.remove('hidden');
            document.body.classList.add('banner-visible');
            // Set CSS variable for banner height
            const height = banner.offsetHeight;
            document.body.style.setProperty('--banner-height', height + 'px');
            window.addEventListener('resize', () => {
                if (!banner.classList.contains('hidden')) {
                    document.body.style.setProperty('--banner-height', banner.offsetHeight + 'px');
                }
            });
        } else {
            banner.classList.add('hidden');
            document.body.classList.remove('banner-visible');
            document.body.style.setProperty('--banner-height', '0px');
        }
    }
});
