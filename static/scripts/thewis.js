// Thewis - simple toast notifications minimal implementation
(function () {
    'use strict';
    const containerId = 'thewis-container';

    function ensureContainer() {
        let c = document.getElementById(containerId);
        if (!c) {
            c = document.createElement('div');
            c.id = containerId;
            c.style.position = 'fixed';
            c.style.right = '20px';
            c.style.top = '20px';
            c.style.zIndex = 99999;
            document.body.appendChild(c);
        }
        return c;
    }

    function createToast(message, type='info', timeout=4500) {
        const c = ensureContainer();
        const el = document.createElement('div');
        el.className = 'thewis-toast thewis-' + type;
        el.style.minWidth = '220px';
        el.style.marginTop = '8px';
        el.style.padding = '10px 14px';
        el.style.borderRadius = '6px';
        el.style.color = '#fff';
        el.style.boxShadow = '0 6px 18px rgba(0,0,0,0.12)';
        el.style.fontFamily = 'Arial, sans-serif';
        el.style.fontSize = '14px';
        el.style.opacity = '0';
        el.style.transition = 'opacity 200ms ease, transform 200ms ease';

        if (type === 'error') el.style.background = '#e74c3c';
        else if (type === 'success') el.style.background = '#2ecc71';
        else if (type === 'warn') el.style.background = '#f39c12';
        else el.style.background = '#3498db';

        el.textContent = message;
        c.appendChild(el);

        // animate in
        requestAnimationFrame(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        });

        if (timeout > 0) {
            setTimeout(() => {
                // animate out
                el.style.opacity = '0';
                el.addEventListener('transitionend', () => el.remove());
            }, timeout);
        }
        return el;
    }

    window.Thewis = {
        info: (m, t) => createToast(m, 'info', t),
        success: (m, t) => createToast(m, 'success', t),
        error: (m, t) => createToast(m, 'error', t),
        warn: (m, t) => createToast(m, 'warn', t),
        show: (m, t) => createToast(m, t || 'info', 4500)
    };
})();
