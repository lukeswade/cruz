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
    // Close mobile menu on ANY link click inside nav
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks) navLinks.classList.remove('active');
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
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

    // Instagram Feed
    loadInstagramFeed();

    // AI Chat Widget
    const chatToggle = document.getElementById('ai-chat-toggle');
    const chatPanel = document.getElementById('ai-chat-panel');
    const chatClose = document.getElementById('ai-chat-close');
    const chatForm = document.getElementById('ai-chat-form');
    const chatInput = document.getElementById('ai-chat-input');
    const chatMessages = document.getElementById('ai-chat-messages');

    if (chatToggle && chatPanel) {
        chatToggle.addEventListener('click', () => {
            chatPanel.classList.toggle('active');
        });
        chatClose.addEventListener('click', () => {
            chatPanel.classList.remove('active');
        });

        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const text = chatInput.value.trim();
            if(!text) return;
            
            // Add user message
            const userBox = document.createElement('div');
            userBox.style = "background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; border-bottom-right-radius: 2px; align-self: flex-end; max-width: 85%; color: var(--text-primary);";
            userBox.textContent = text;
            chatMessages.appendChild(userBox);
            chatInput.value = '';
            chatMessages.scrollTop = chatMessages.scrollHeight;

            // Loading dot
            const loadBox = document.createElement('div');
            loadBox.style = "background: rgba(176,38,255,0.1); padding: 10px; border-radius: 8px; border-bottom-left-radius: 2px; max-width: 85%; color: var(--text-secondary);";
            loadBox.textContent = "Typing...";
            chatMessages.appendChild(loadBox);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            try {
                const res = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: text })
                });
                const data = await res.json();
                
                chatMessages.removeChild(loadBox);
                const replyBox = document.createElement('div');
                replyBox.style = "background: rgba(176,38,255,0.1); border: 1px solid rgba(176,38,255,0.2); padding: 10px; border-radius: 8px; border-bottom-left-radius: 2px; max-width: 85%; color: var(--text-primary);";
                replyBox.textContent = data.reply || "Sorry, I'm having trouble thinking right now.";
                chatMessages.appendChild(replyBox);
                chatMessages.scrollTop = chatMessages.scrollHeight;

            } catch (err) {
                chatMessages.removeChild(loadBox);
            }
        });
    }
});

async function loadInstagramFeed() {
    const grid = document.getElementById('ig-grid');
    if (!grid) return;

    try {
        const res = await fetch('/api/instagram');
        const data = await res.json();

        if (!data.data || data.error) {
            grid.closest('section').style.display = 'none';
            return;
        }

        data.data.forEach(post => {
            const src = post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url;
            if (!src) return;

            const a = document.createElement('a');
            a.href = post.permalink;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.className = 'ig-item';

            const img = document.createElement('img');
            img.src = src;
            img.alt = 'Cruz Coaching on Instagram';
            img.loading = 'lazy';

            if (post.media_type === 'VIDEO') {
                const badge = document.createElement('span');
                badge.className = 'ig-video-badge';
                badge.textContent = '▶';
                a.appendChild(badge);
            }

            a.appendChild(img);
            grid.appendChild(a);
        });
    } catch (e) {
        const section = grid.closest('section');
        if (section) section.style.display = 'none';
    }
}
