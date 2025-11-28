// admin-login.js - Login de Administrador
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('adminLoginForm');
    const loginAlert = document.getElementById('loginAlert');

    // Logo placeholder
    const logoImg = document.getElementById('logo-iuca-login');
    if (logoImg && !logoImg.complete) {
        logoImg.onerror = function() {
            const svgLogo = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svgLogo.setAttribute('width', '60');
            svgLogo.setAttribute('height', '60');
            svgLogo.setAttribute('viewBox', '0 0 60 60');
            svgLogo.innerHTML = '<rect width="60" height="60" fill="#FFFFFF"/><text x="50%" y="50%" fill="#0F1F45" font-weight="700" font-size="24" text-anchor="middle" dominant-baseline="middle">IUCA</text>';
            logoImg.parentNode.replaceChild(svgLogo, logoImg);
        };
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const usuario = document.getElementById('adminUsuario').value;
        const password = document.getElementById('adminPassword').value;

        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ usuario, password })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showThewiAnimation(data.message || 'Inicio de sesión exitoso.');
                setTimeout(() => {
                    window.location.href = data.redirect || '/admin-dashboard';
                }, 1800);
            } else {
                showAlert('error', data.message || 'Credenciales incorrectas.');
            }
        })
        .catch(() => {
            showAlert('error', 'Error de conexión con el servidor.');
        });
    });

    function showAlert(type, message) {
        loginAlert.className = 'login-alert ' + type;
        loginAlert.textContent = message;
        loginAlert.style.display = 'block';
        loginAlert.style.animation = '';
    }

    function showThewiAnimation(message) {
        loginAlert.className = 'login-alert success';
        loginAlert.textContent = '';
        loginAlert.style.display = 'block';
        loginAlert.style.animation = 'thewi-bounce 1.2s cubic-bezier(.36,.07,.19,.97) both';
        // Animación tipo "thewi" (rebote y fade)
        loginAlert.innerHTML = `<span style="font-size:2em;display:inline-block;animation:thewi-bounce 1.2s cubic-bezier(.36,.07,.19,.97) both;">🎉</span><br><span style="font-size:1.1em;">${message}</span>`;
    }

    // Agregar animación CSS
    const style = document.createElement('style');
    style.innerHTML = `@keyframes thewi-bounce {0%{transform:scale(.8);opacity:0;}50%{transform:scale(1.1);opacity:1;}70%{transform:scale(.95);}100%{transform:scale(1);opacity:1;}}`;
    document.head.appendChild(style);
});

function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    field.type = field.type === 'password' ? 'text' : 'password';
}

// Hacer la función global
window.togglePassword = togglePassword;
