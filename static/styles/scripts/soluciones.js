// ===================================
// PÁGINA DE SOLUCIONES - SCRIPT INTERACTIVO
// ===================================

document.addEventListener("DOMContentLoaded", function () {
  // Inicializar funcionalidad de expandir/contraer
  initializeExpandButtons();

  // Agregar desplazamiento suave para la navegación
  initializeSmoothScroll();

  // Agregar animaciones de entrada
  initializeScrollAnimations();
});

/**
 * Inicializar botones de expandir/contraer para tarjetas de soluciones
 */
function initializeExpandButtons() {
  const expandButtons = document.querySelectorAll(".btn-expand");

  expandButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const targetId = this.getAttribute("data-target");
      const targetDetails = document.getElementById(targetId);
      const isExpanded = targetDetails.classList.contains("expanded");

      // Cerrar primero todos los demás detalles expandidos
      document
        .querySelectorAll(".solution-details.expanded")
        .forEach((detail) => {
          if (detail.id !== targetId) {
            detail.classList.remove("expanded");
            const otherButton = document.querySelector(
              `[data-target="${detail.id}"]`
            );
            if (otherButton) {
              otherButton.classList.remove("active");
              otherButton.innerHTML = `
              Ver Detalles
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            `;
            }
          }
        });

      // Alternar detalle actual
      if (isExpanded) {
        targetDetails.classList.remove("expanded");
        this.classList.remove("active");
        this.innerHTML = `
          Ver Detalles
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `;
      } else {
        targetDetails.classList.add("expanded");
        this.classList.add("active");
        this.innerHTML = `
          Ocultar Detalles
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `;

        // Desplazarse suavemente a la tarjeta expandida
        setTimeout(() => {
          const card = this.closest(".solution-card");
          const cardTop = card.offsetTop;
          window.scrollTo({
            top: cardTop - 100,
            behavior: "smooth",
          });
        }, 100);
      }
    });
  });
}

/**
 * Inicializar desplazamiento suave para enlaces de ancla
 */
function initializeSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");

      // Omitir si es solo '#'
      if (href === "#") return;

      e.preventDefault();

      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });
}

/**
 * Agregar animaciones de entrada activadas por desplazamiento
 */
function initializeScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -100px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "0";
        entry.target.style.transform = "translateY(30px)";

        // Activar animación
        setTimeout(() => {
          entry.target.style.transition =
            "opacity 0.6s ease, transform 0.6s ease";
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }, 100);

        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observar tarjetas de soluciones
  document.querySelectorAll(".solution-card").forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.1}s`;
    observer.observe(card);
  });
}

/**
 * Agregar efectos hover a tarjetas flotantes
 */
function initializeFloatingCards() {
  const floatingCards = document.querySelectorAll(".floating-card");

  floatingCards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-10px) scale(1.05)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0) scale(1)";
    });
  });
}

/**
 * Inicializar efecto parallax en la sección hero
 */
function initializeParallax() {
  const hero = document.querySelector(".solutions-hero");

  if (!hero) return;

  window.addEventListener("scroll", () => {
    const scrolled = window.pageYOffset;
    const parallaxSpeed = 0.5;

    if (scrolled < window.innerHeight) {
      hero.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
    }
  });
}

// Inicializar características adicionales
initializeFloatingCards();
initializeParallax();

/**
 * Agregar soporte para navegación con teclado
 */
document.addEventListener("keydown", function (e) {
  // Cerrar detalles expandidos con la tecla ESC
  if (e.key === "Escape") {
    const expandedDetails = document.querySelector(
      ".solution-details.expanded"
    );
    if (expandedDetails) {
      const button = document.querySelector(
        `[data-target="${expandedDetails.id}"]`
      );
      if (button) {
        button.click();
      }
    }
  }
});

/**
 * Seguimiento de analíticas para clics en botones
 */
function trackSolutionView(solutionName) {
  // Agregar tu seguimiento de analíticas aquí
  console.log(`Solution viewed: ${solutionName}`);
}

// Rastrear expansiones de tarjetas de soluciones
document.querySelectorAll(".btn-expand").forEach((button) => {
  button.addEventListener("click", function () {
    const solutionCard = this.closest(".solution-card");
    const solutionTitle =
      solutionCard.querySelector(".solution-title").textContent;
    trackSolutionView(solutionTitle);
  });
});
