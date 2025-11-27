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
        const email = document.getElementById('adminEmail').value;

        // Validación simple (en producción esto se haría con backend)
        if (usuario === 'admin' && password === 'admin123' && email.includes('@')) {
            // Guardar sesión
            const adminData = {
                usuario: usuario,
                email: email,
                loginTime: new Date().toISOString()
            };
            localStorage.setItem('adminSession', JSON.stringify(adminData));
            
            showAlert('success', 'Inicio de sesión exitoso. Redirigiendo...');
            
            setTimeout(() => {
                window.location.href = 'admin-dashboard.html';
            }, 1000);
        } else {
            showAlert('error', 'Credenciales incorrectas. Usuario: admin, Contraseña: admin123');
        }
    });

    function showAlert(type, message) {
        loginAlert.className = 'login-alert ' + type;
        loginAlert.textContent = message;
        loginAlert.style.display = 'block';
    }
});

function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    field.type = field.type === 'password' ? 'text' : 'password';
}

// Hacer la función global
window.togglePassword = togglePassword;
