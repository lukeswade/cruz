document.addEventListener('DOMContentLoaded', () => {

    const navbar = document.querySelector('.navbar');
    const toggle = document.getElementById('mobile-toggle');
    const navLinks = document.querySelector('.nav-links');

    // Navbar scroll effect
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(5, 5, 5, 0.95)';
                navbar.style.backdropFilter = 'blur(20px)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.03)';
                navbar.style.backdropFilter = 'blur(12px)';
            }
        });
    }

    // Mobile menu toggle
    if (toggle && navLinks) {
        toggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Smooth scroll + auto-close mobile menu — single unified handler
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                
                // Close mobile menu if open
                if (navLinks) {
                    navLinks.classList.remove('active');
                }
                
                // Scroll to target with navbar offset
                const offset = navbar ? navbar.offsetHeight + 10 : 0;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // Intersection Observer for Scroll Animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-up, .fade-left').forEach(el => observer.observe(el));
    // Subscription gating for Sign‑Up section
    const signupContainer = document.getElementById('signup-container');
    const subscribePrompt = document.getElementById('subscribe-prompt');
    if (signupContainer && subscribePrompt) {
        const hasSubscription = localStorage.getItem('hasSubscription') === 'true';
        if (hasSubscription) {
            signupContainer.style.display = 'block';
            subscribePrompt.style.display = 'none';
        } else {
            signupContainer.style.display = 'none';
            subscribePrompt.style.display = 'block';
        }
    }

});
