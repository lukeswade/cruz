document.addEventListener('DOMContentLoaded', () => {

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(8, 8, 10, 0.9)';
            navbar.style.backdropFilter = 'blur(12px)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.03)';
            navbar.style.backdropFilter = 'blur(12px)';
        }
    });

    // Mobile menu toggle
    const toggle = document.getElementById('mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if(toggle) {
        toggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Intersection Observer for Scroll Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-up, .fade-left');
    animatedElements.forEach(el => observer.observe(el));

});
