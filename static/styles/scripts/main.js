// main.js - Landing Page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Logo placeholder replacement
    const logoImg = document.getElementById('logo-iuca');
    if (logoImg && !logoImg.complete) {
        logoImg.onerror = function() {
            // Si no se encuentra el logo, crear un placeholder SVG
            const svgLogo = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svgLogo.setAttribute('width', '40');
            svgLogo.setAttribute('height', '40');
            svgLogo.setAttribute('viewBox', '0 0 40 40');
            svgLogo.innerHTML = '<rect width="40" height="40" fill="#0F1F45"/><text x="50%" y="50%" fill="#FFFFFF" font-weight="700" font-size="16" text-anchor="middle" dominant-baseline="middle">I</text>';
            logoImg.parentNode.replaceChild(svgLogo, logoImg);
        };
    }

    // Smooth scroll for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Animate cards on scroll
    const cards = document.querySelectorAll('.feature-card, .solution-block');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});
