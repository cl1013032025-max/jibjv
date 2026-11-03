/* ============================================================
   ANIMOTION STUDIO — script.js
   Interacciones, animaciones y experiencia de usuario.
   ============================================================ */

"use strict";

/* ------------------------------------------------------------------
   CONFIGURACIÓN DEL FORMULARIO
   Cuando tengas un backend, coloca aquí la URL del endpoint.
   Ejemplo: const FORM_ENDPOINT = "https://tu-api.com/contacto";
   Si se deja vacío, el formulario solo valida en el navegador y lo
   indica claramente al usuario. No se simula un envío real.
------------------------------------------------------------------- */
const FORM_ENDPOINT = "";

const doc = document.documentElement;
const body = document.body;
const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(pointer: fine)");

doc.classList.remove("no-js");
doc.classList.add("js");
body.classList.add("is-loading");

/* ------------------------------------------------------------------
   01. PRELOADER
------------------------------------------------------------------- */
function initPreloader() {
  const preloader = $("#preloader");
  if (!preloader) return;

  const startedAt = performance.now();
  let finished = false;

  function hidePreloader() {
    if (finished) return;
    finished = true;
    preloader.classList.add("is-hidden");
    body.classList.remove("is-loading");
    window.setTimeout(() => preloader.remove(), 850);
  }

  function finish() {
    const elapsed = performance.now() - startedAt;
    window.setTimeout(hidePreloader, Math.max(0, 1100 - elapsed));
  }

  if (document.readyState === "complete") {
    finish();
  } else {
    window.addEventListener("load", finish, { once: true });
  }

  // Red de seguridad: nunca bloquear la página más de 4 segundos.
  window.setTimeout(hidePreloader, 4000);
}

/* ------------------------------------------------------------------
   02. PARTÍCULAS
------------------------------------------------------------------- */
function initParticles() {
  const canvas = $("#particles-canvas");
  if (!canvas || reducedMotion.matches) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let particles = [];
  let animationFrame = 0;
  const mouse = { x: -9999, y: -9999, active: false };
  const colors = ["0, 191, 255", "0, 255, 255", "138, 43, 226", "191, 0, 255"];

  function createParticle() {
    const color = colors[Math.floor(Math.random() * colors.length)];
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      radius: Math.random() * 1.45 + 0.35,
      alpha: Math.random() * 0.42 + 0.1,
      color
    };
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(84, Math.max(34, Math.floor((width * height) / 23000)));
    particles = Array.from({ length: count }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i];

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20;
      if (p.y > height + 20) p.y = -20;

      if (mouse.active) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 135 && distance > 0.01) {
          const force = (135 - distance) / 135;
          p.x += (dx / distance) * force * 1.35;
          p.y += (dy / distance) * force * 1.35;
        }
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
      ctx.fill();
    }

    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.hypot(dx, dy);

        if (distance < 112) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(0, 191, 255, ${(1 - distance / 112) * 0.115})`;
          ctx.lineWidth = 0.55;
          ctx.stroke();
        }
      }
    }

    animationFrame = window.requestAnimationFrame(draw);
  }

  function handlePointerMove(event) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    mouse.active = true;
  }

  window.addEventListener("pointermove", handlePointerMove, { passive: true });
  document.addEventListener("pointerleave", () => {
    mouse.active = false;
  });

  window.addEventListener("resize", () => {
    window.cancelAnimationFrame(animationFrame);
    resize();
    draw();
  });

  resize();
  draw();
}

/* ------------------------------------------------------------------
   03. CURSOR PERSONALIZADO
------------------------------------------------------------------- */
function initCursor() {
  if (!finePointer.matches || reducedMotion.matches) return;

  const dot = $("#cursor-dot");
  const ring = $("#cursor-ring");
  if (!dot || !ring) return;

  doc.classList.add("has-custom-cursor");

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let cursorFrame = 0;

  const interactiveSelector =
    "a, button, input, textarea, .service-card, .gallery-item, .video-feature, .video-mini, .project-card__media, .team-card, .filter, .hero-play, .video-play";

  function renderCursor() {
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
    cursorFrame = window.requestAnimationFrame(renderCursor);
  }

  window.addEventListener(
    "pointermove",
    (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    },
    { passive: true }
  );

  document.addEventListener("pointerover", (event) => {
    if (event.target.closest(interactiveSelector)) {
      ring.classList.add("is-hovering");
    }
  });

  document.addEventListener("pointerout", (event) => {
    if (event.target.closest(interactiveSelector)) {
      ring.classList.remove("is-hovering");
    }
  });

  document.addEventListener("pointerleave", () => {
    dot.style.opacity = "0";
    ring.style.opacity = "0";
  });

  document.addEventListener("pointerenter", () => {
    dot.style.opacity = "1";
    ring.style.opacity = "1";
  });

  renderCursor();

  window.addEventListener("pagehide", () => window.cancelAnimationFrame(cursorFrame));
}

/* ------------------------------------------------------------------
   04. HEADER, PROGRESO Y VOLVER ARRIBA
------------------------------------------------------------------- */
function initHeaderAndScroll() {
  const header = $("#site-header");
  const progress = $("#scroll-progress");
  const backToTop = $("#back-to-top");
  let ticking = false;

  function update() {
    const y = window.scrollY || window.pageYOffset;
    const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
    const ratio = Math.min(1, Math.max(0, y / maxScroll));

    if (header) header.classList.toggle("is-scrolled", y > 30);
    if (progress) progress.style.transform = `scaleX(${ratio})`;
    if (backToTop) backToTop.classList.toggle("is-visible", y > 620);
    doc.style.setProperty("--scroll-progress", ratio.toFixed(4));
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  update();

  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: reducedMotion.matches ? "auto" : "smooth"
      });
    });
  }
}

/* ------------------------------------------------------------------
   05. MENÚ RESPONSIVE
------------------------------------------------------------------- */
function initMenu() {
  const toggle = $("#nav-toggle");
  const nav = $("#main-nav");
  const backdrop = $("#menu-backdrop");
  if (!toggle || !nav) return;

  function setMenu(open) {
    body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú de navegación" : "Abrir menú de navegación");
    if (!open) {
      // Devuelve el foco solo si el menú se cerró con Escape.
      if (body.classList.contains("menu-was-keyboard")) {
        toggle.focus();
        body.classList.remove("menu-was-keyboard");
      }
    }
  }

  toggle.addEventListener("click", () => {
    setMenu(!body.classList.contains("menu-open"));
  });

  if (backdrop) backdrop.addEventListener("click", () => setMenu(false));

  $$(".main-nav__link", nav).forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && body.classList.contains("menu-open")) {
      body.classList.add("menu-was-keyboard");
      setMenu(false);
    }
  });

  const desktopQuery = window.matchMedia("(min-width: 1111px)");
  const handleDesktop = (event) => {
    if (event.matches) setMenu(false);
  };
  if (desktopQuery.addEventListener) desktopQuery.addEventListener("change", handleDesktop);
  else desktopQuery.addListener(handleDesktop);
}

/* ------------------------------------------------------------------
   06. NAVEGACIÓN ACTIVA (SCROLL SPY)
------------------------------------------------------------------- */
function initScrollSpy() {
  const links = $$(".main-nav__link");
  if (!links.length) return;

  const sections = links
    .map((link) => {
      const id = link.getAttribute("href");
      return id && id.startsWith("#") ? $(id) : null;
    })
    .filter(Boolean);

  if (!sections.length || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = "#" + entry.target.id;
        links.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === id);
        });
      });
    },
    { rootMargin: "-38% 0px -54% 0px", threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

/* ------------------------------------------------------------------
   07. APARICIÓN AL SCROLL
------------------------------------------------------------------- */
function initReveals() {
  const elements = $$("[data-reveal]");
  if (!elements.length) return;

  elements.forEach((element) => {
    if (element.dataset.delay) {
      element.style.setProperty("--reveal-delay", `${Number(element.dataset.delay) || 0}ms`);
    }
  });

  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, revealObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -45px 0px" }
  );

  elements.forEach((element) => observer.observe(element));
}

/* ------------------------------------------------------------------
   08. CONTADORES
------------------------------------------------------------------- */
function initCounters() {
  const counters = $$("[data-count]");
  if (!counters.length) return;

  function animate(element) {
    if (element.dataset.animated === "true") return;
    element.dataset.animated = "true";

    const target = Number(element.dataset.count) || 0;
    const duration = 1450;
    const start = performance.now();

    function step(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = Math.round(target * eased).toLocaleString("es-ES");
      if (progress < 1) window.requestAnimationFrame(step);
    }

    window.requestAnimationFrame(step);
  }

  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    counters.forEach((counter) => {
      counter.textContent = Number(counter.dataset.count).toLocaleString("es-ES");
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries, counterObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.62 }
  );

  counters.forEach((counter) => observer.observe(counter));
}

/* ------------------------------------------------------------------
   09. PARALLAX SUAVE
------------------------------------------------------------------- */
function initParallax() {
  if (reducedMotion.matches) return;

  const items = $$("[data-parallax]");
  if (!items.length) return;

  let ticking = false;

  function update() {
    const viewportHeight = window.innerHeight;

    items.forEach((item) => {
      const speed = Number(item.dataset.parallax) || 0;
      const rect = item.getBoundingClientRect();

      if (rect.bottom < -100 || rect.top > viewportHeight + 100) return;

      const centerOffset = rect.top + rect.height / 2 - viewportHeight / 2;
      const translate = centerOffset * speed;
      item.style.transform = `translate3d(0, ${translate.toFixed(2)}px, 0)`;
    });

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
}

/* ------------------------------------------------------------------
   10. TILT 3D + BRILLO EN TARJETAS
------------------------------------------------------------------- */
function init3DEffects() {
  if (!finePointer.matches || reducedMotion.matches) return;

  const stage = $("#hero-stage");
  const visual = $(".hero__visual");

  if (stage && visual) {
    visual.addEventListener("pointermove", (event) => {
      const rect = visual.getBoundingClientRect();
      const relativeX = (event.clientX - rect.left) / rect.width - 0.5;
      const relativeY = (event.clientY - rect.top) / rect.height - 0.5;
      const rotateX = (-relativeY * 8).toFixed(2);
      const rotateY = (relativeX * 10).toFixed(2);
      stage.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    visual.addEventListener("pointerleave", () => {
      stage.style.transform = "rotateX(0deg) rotateY(0deg)";
    });
  }

  $$(".service-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    });
  });
}

/* ------------------------------------------------------------------
   11. GALERÍA + LIGHTBOX
------------------------------------------------------------------- */
function initGallery() {
  const items = $$(".gallery-item");
  const lightbox = $("#lightbox");
  const image = $("#lightbox-image");
  const title = $("#lightbox-title");
  const category = $("#lightbox-category");
  const count = $("#lightbox-count");
  const prev = $("#lightbox-prev");
  const next = $("#lightbox-next");

  if (!items.length || !lightbox || !image || !title || !category || !count) return;

  let currentIndex = 0;

  function openAt(index) {
    currentIndex = (index + items.length) % items.length;
    const item = items[currentIndex];
    const itemImage = $("img", item);
    const itemTitle = $(".gallery-item__title", item);
    const itemCategory = $(".gallery-item__tag", item);

    image.src = itemImage ? itemImage.currentSrc || itemImage.src : "";
    image.alt = itemImage ? itemImage.alt : "";
    title.textContent = itemTitle ? itemTitle.textContent : "Proyecto";
    category.textContent = itemCategory ? itemCategory.textContent : "GALERÍA";
    count.textContent = `${String(currentIndex + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}`;

    if (image.animate && !reducedMotion.matches) {
      image.animate(
        [
          { opacity: 0.35, transform: "scale(0.985)" },
          { opacity: 1, transform: "scale(1)" }
        ],
        { duration: 330, easing: "ease-out" }
      );
    }

    if (!lightbox.classList.contains("is-open")) {
      openModal(lightbox);
    }
  }

  items.forEach((item) => {
    item.addEventListener("click", () => {
      openAt(Number(item.dataset.galleryIndex) || 0);
    });
  });

  if (prev) prev.addEventListener("click", () => openAt(currentIndex - 1));
  if (next) next.addEventListener("click", () => openAt(currentIndex + 1));

  $$("[data-close-lightbox]").forEach((closeButton) => {
    closeButton.addEventListener("click", () => closeModal(lightbox));
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      openAt(currentIndex - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      openAt(currentIndex + 1);
    }
  });
}

/* ------------------------------------------------------------------
   12. VIDEOS + MODAL YOUTUBE
------------------------------------------------------------------- */
function initVideos() {
  const modal = $("#video-modal");
  const frame = $("#video-frame");
  const title = $("#video-modal-title");
  const meta = $("#video-modal-meta");
  const youtubeLink = $("#video-youtube-link");

  if (!modal || !frame || !title || !meta) return;

  function openVideo(id, videoTitle, videoMeta) {
    if (!id) return;

    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&modestbranding=1`;
    iframe.title = videoTitle || "Reproductor de video";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.loading = "lazy";

    frame.replaceChildren(iframe);
    title.textContent = videoTitle || "Video";
    meta.textContent = videoMeta || "";
    if (youtubeLink) youtubeLink.href = `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`;

    openModal(modal);
  }

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-video]");
    if (!trigger) return;

    // Evita que un clic en un botón interno abra el modal dos veces.
    event.preventDefault();
    openVideo(
      trigger.dataset.video,
      trigger.dataset.videoTitle || "Video",
      trigger.dataset.videoMeta || ""
    );
  });

  $$("[data-close-video]").forEach((closeButton) => {
    closeButton.addEventListener("click", () => {
      closeModal(modal);
    });
  });

  modal.addEventListener("transitionend", () => {
    if (!modal.classList.contains("is-open")) frame.replaceChildren();
  });
}

/* ------------------------------------------------------------------
   13. PORTAFOLIO CON FILTROS
------------------------------------------------------------------- */
function initPortfolioFilters() {
  const filters = $$(".filter");
  const cards = $$(".project-card");
  const grid = $("#portfolio-grid");
  if (!filters.length || !cards.length || !grid) return;

  const labels = {
    all: "Todos",
    "2d": "2D",
    "3d": "3D",
    motion: "Motion Graphics",
    personajes: "Personajes"
  };

  let liveRegion = $("#portfolio-status");
  if (!liveRegion) {
    liveRegion = document.createElement("p");
    liveRegion.id = "portfolio-status";
    liveRegion.className = "sr-only";
    liveRegion.setAttribute("role", "status");
    liveRegion.setAttribute("aria-live", "polite");
    grid.parentNode.insertBefore(liveRegion, grid);
  }

  function applyFilter(filter) {
    let visibleCount = 0;

    cards.forEach((card) => {
      const matches = filter === "all" || card.dataset.category === filter;
      card.hidden = !matches;

      if (matches) {
        visibleCount += 1;
        card.classList.add("is-visible");
        // Reinicia la animación de entrada al cambiar de filtro.
        card.classList.remove("is-revealing");
        void card.offsetWidth;
        card.classList.add("is-revealing");
      } else {
        card.classList.remove("is-revealing");
      }
    });

    filters.forEach((button) => {
      const isActive = button.dataset.filter === filter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    liveRegion.textContent = `Mostrando ${visibleCount} ${
      visibleCount === 1 ? "proyecto" : "proyectos"
    } en la categoría ${labels[filter] || filter}.`;
  }

  filters.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.classList.contains("is-active")) return;
      applyFilter(button.dataset.filter || "all");
    });
  });

  applyFilter("all");
}

/* ------------------------------------------------------------------
   14. ARTÍCULOS DEL BLOG
------------------------------------------------------------------- */
const ARTICLES = {
  timing: {
    image: "assets/animotion/blog-01.jpg",
    alt: "Equipo de cine trabajando en una producción audiovisual",
    tag: "ANIMACIÓN",
    meta: ["12 OCT 2026", "6 MIN DE LECTURA"],
    title: "La animación que respira: el arte invisible del timing",
    body: [
      {
        type: "p",
        text: "El timing es la decisión más silenciosa y, a la vez, la más determinante de la animación. No se ve como se ve una línea o un color: se siente en el cuerpo. Un personaje que gira la cabeza en el momento exacto puede transmitir duda; el mismo giro unos frames antes puede convertir esa duda en amenaza."
      },
      {
        type: "p",
        text: "En el estudio trabajamos el timing como si fuera música. Primero definimos el pulso general de la escena, después marcamos los acentos y, por último, dejamos que el silencio haga su trabajo. Ese silencio son los frames de anticipación y las pausas que permiten que el público respire."
      },
      { type: "h4", text: "Tres ejercicios para entrenar el ojo" },
      {
        type: "p",
        text: "Uno: anima una pelota que rebota sin mirar la referencia y luego compara el resultado con material real. Dos: reproduce la misma acción a 12, 24 y 30 fotogramas por segundo para entender cómo cambia la percepción de peso. Tres: elimina un frame clave y observa qué emoción desaparece."
      },
      {
        type: "p",
        text: "La técnica se aprende, pero el ritmo se cultiva. Rodearse de edición, danza, teatro y montaje ayuda más de lo que parece. Al final, animar es escuchar una intención y encontrar el instante preciso en el que el movimiento se vuelve inevitable."
      }
    ]
  },
  personaje: {
    image: "assets/animotion/blog-02.jpg",
    alt: "Mesa de trabajo de un diseñador con bocetos y herramientas",
    tag: "PERSONAJES",
    meta: ["28 SEP 2026", "5 MIN DE LECTURA"],
    title: "Del boceto al alma: cómo nace un personaje memorable",
    body: [
      {
        type: "p",
        text: "Antes de dibujar una cara, dibujamos una contradicción. Un personaje que solo cumple una función es un recurso; uno que parece contradecir sus propias reglas se convierte en una presencia. La silueta puede ser amable, pero la mirada sostiene algo que no termina de encajar."
      },
      {
        type: "p",
        text: "Ese desajuste es el que invita a mirar dos veces. En el estudio exploramos primero formas grandes, casi abstractas, para comprobar si el personaje se reconoce a contraluz. Si la silueta no cuenta nada, ningún detalle lo va a salvar."
      },
      { type: "h4", text: "El personaje vive en los extremos" },
      {
        type: "p",
        text: "Definimos dos o tres gestos extremos: cómo se ríe, cómo pide permiso, cómo esquiva una mirada. Esos momentos funcionan como anclas emocionales. A partir de ellos construimos la escala de expresiones y el vocabulario de movimiento que usará el equipo de animación."
      },
      {
        type: "p",
        text: "La memoria es selectiva. Recordamos a los personajes por una postura, una pausa o una forma de entrar en escena. Por eso dedicamos tanto tiempo a lo que el personaje hace cuando cree que nadie lo está mirando."
      }
    ]
  },
  iluminacion: {
    image: "assets/animotion/blog-03.jpg",
    alt: "Composición 3D con iluminación de estudio",
    tag: "TÉCNICA 3D",
    meta: ["09 SEP 2026", "8 MIN DE LECTURA"],
    title: "Luz cinematográfica en 3D: menos lámparas, más intención",
    body: [
      {
        type: "p",
        text: "La iluminación en 3D no consiste en llenar la escena de luces, sino en decidir qué se oculta. Una sola fuente bien motivada puede decir más que seis luces correctas. La pregunta útil nunca es cuántas luces hacen falta, sino qué verdad queremos revelar con cada sombra."
      },
      {
        type: "p",
        text: "Empezamos por la fuente que el público entendería si estuviera dentro del set: una ventana, una pantalla, una farola. Después construimos el contraste desde ahí. Si la motivación es clara, el espectador acepta niveles de dramatismo que de otro modo parecerían artificiales."
      },
      { type: "h4", text: "El contraste como argumento" },
      {
        type: "p",
        text: "Usamos el contraste para ordenar emociones. La luz dura aísla y acusa; la luz suave acoge y difumina. En una misma secuencia podemos pasar de una caricia a una amenaza solo cambiando el tamaño relativo de la fuente y la dureza del borde de la sombra."
      },
      {
        type: "p",
        text: "La clave está en mirar la imagen terminada, no la escena de luces. Un render bonito en aislado puede romper el ritmo de una secuencia. La luz debe estar al servicio del montaje y del silencio que la rodea."
      }
    ]
  },
  motion: {
    image: "assets/animotion/blog-04.jpg",
    alt: "Pantallas con interfaces y sistemas de diseño en movimiento",
    tag: "MOTION",
    meta: ["22 AGO 2026", "4 MIN DE LECTURA"],
    title: "Motion graphics: ritmo visual para marcas que se mueven",
    body: [
      {
        type: "p",
        text: "Una identidad deja de ser un archivo estático en el momento en que aprende a entrar, salir y respirar. El motion graphics no decora una marca: construye su comportamiento. La forma en que un logotipo aparece puede ser tan reconocible como su color."
      },
      {
        type: "p",
        text: "Antes de abrir la herramienta de animación definimos tres decisiones: velocidad base, tipo de aceleración y familia de transiciones. Con esas reglas, cualquier pieza nueva puede parecer parte del mismo universo sin necesidad de repetir la misma animación."
      },
      { type: "h4", text: "Un sistema, no una colección de efectos" },
      {
        type: "p",
        text: "El error más común es tratar cada vídeo como un proyecto aislado. Nosotros documentamos duraciones, curvas y márgenes de seguridad para que el sistema sobreviva a formatos verticales, pantallas grandes y futuros equipos creativos."
      },
      {
        type: "p",
        text: "Cuando el ritmo está bien diseñado, la marca se reconoce incluso sin sonido y con los ojos entrecerrados. Ese es el objetivo: que el movimiento no grite, pero tampoco pase desapercibido."
      }
    ]
  }
};

function initArticleModal() {
  const modal = $("#article-modal");
  const image = $("#article-modal-image");
  const tag = $("#article-modal-tag");
  const meta = $("#article-modal-meta");
  const title = $("#article-modal-title");
  const bodyContainer = $("#article-modal-body");
  if (!modal || !image || !tag || !meta || !title || !bodyContainer) return;

  function renderMeta(items) {
    meta.replaceChildren();
    items.forEach((item) => {
      const span = document.createElement("span");
      span.textContent = item;
      meta.append(span);
    });
  }

  function renderBody(blocks) {
    bodyContainer.replaceChildren();
    blocks.forEach((block) => {
      const element = document.createElement(block.type === "h4" ? "h4" : "p");
      element.textContent = block.text;
      bodyContainer.append(element);
    });
  }

  function openArticle(key) {
    const article = ARTICLES[key];
    if (!article) return;

    image.src = article.image;
    image.alt = article.alt;
    tag.textContent = article.tag;
    title.textContent = article.title;
    renderMeta(article.meta);
    renderBody(article.body);

    openModal(modal);
    const content = $(".article-modal__content", modal);
    if (content) content.scrollTop = 0;
    const dialog = $(".article-modal__dialog", modal);
    if (dialog) dialog.scrollTop = 0;
  }

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-article]");
    if (!trigger) return;
    event.preventDefault();
    openArticle(trigger.dataset.article);
  });

  $$("[data-close-article]").forEach((button) => {
    button.addEventListener("click", () => closeModal(modal));
  });
}

/* ------------------------------------------------------------------
   15. FORMULARIO DE CONTACTO
------------------------------------------------------------------- */
function initContactForm() {
  const form = $("#contact-form");
  if (!form) return;

  const submit = $("#contact-submit");
  const submitLabel = submit ? $("span", submit) : null;
  const status = $("#form-status");
  const message = $("#contact-message");
  const counter = $("#message-counter");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
  let submitting = false;

  const fields = [
    {
      input: $("#contact-name"),
      error: $("#error-name"),
      validate(value) {
        if (value.trim().length < 2) return "Escribe tu nombre (mínimo 2 caracteres).";
        return "";
      }
    },
    {
      input: $("#contact-email"),
      error: $("#error-email"),
      validate(value) {
        if (!value.trim()) return "Necesitamos tu correo electrónico.";
        if (!emailPattern.test(value.trim())) return "Escribe un correo válido, por ejemplo nombre@dominio.com.";
        return "";
      }
    },
    {
      input: $("#contact-subject"),
      error: $("#error-subject"),
      validate(value) {
        if (value.trim().length < 3) return "Resume tu idea en al menos 3 caracteres.";
        return "";
      }
    },
    {
      input: $("#contact-message"),
      error: $("#error-message"),
      validate(value) {
        if (value.trim().length < 20) return "Cuéntanos un poco más (mínimo 20 caracteres).";
        if (value.length > 600) return "El mensaje no puede superar los 600 caracteres.";
        return "";
      }
    }
  ].filter((field) => field.input && field.error);

  function setStatus(messageText, type) {
    if (!status) return;
    status.textContent = messageText;
    status.className = "form-status" + (messageText ? " is-visible" : "");
    if (type) status.classList.add(`is-${type}`);
  }

  function setFieldState(field, errorMessage) {
    const wrapper = field.input.closest(".field");
    const hasError = Boolean(errorMessage);

    if (wrapper) wrapper.classList.toggle("has-error", hasError);
    field.input.setAttribute("aria-invalid", String(hasError));
    field.error.textContent = errorMessage;
  }

  function validateField(field) {
    const errorMessage = field.validate(field.input.value);
    setFieldState(field, errorMessage);
    return !errorMessage;
  }

  function validateForm() {
    let firstInvalid = null;

    fields.forEach((field) => {
      if (!validateField(field) && !firstInvalid) firstInvalid = field.input;
    });

    if (firstInvalid) {
      setStatus("Revisa los campos marcados. Necesitamos esos datos para responderte.", "info");
      firstInvalid.focus({ preventScroll: true });
      firstInvalid.scrollIntoView({
        behavior: reducedMotion.matches ? "auto" : "smooth",
        block: "center"
      });
      return false;
    }

    return true;
  }

  function updateCounter() {
    if (!counter || !message) return;
    const length = message.value.length;
    counter.textContent = `${length} / 600`;
    counter.classList.toggle("is-near-limit", length >= 540);
  }

  fields.forEach((field) => {
    field.input.addEventListener("input", () => {
      if (field.input.getAttribute("aria-invalid") === "true") validateField(field);
      if (field.input === message) updateCounter();
    });

    field.input.addEventListener("blur", () => {
      if (field.input.value.trim()) validateField(field);
    });
  });

  if (message) {
    message.addEventListener("input", updateCounter);
    updateCounter();
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitting) return;

    setStatus("", "");
    if (!validateForm()) return;

    const payload = {
      name: $("#contact-name").value.trim(),
      email: $("#contact-email").value.trim(),
      subject: $("#contact-subject").value.trim(),
      message: message ? message.value.trim() : ""
    };

    if (!FORM_ENDPOINT) {
      setStatus(
        "Tu mensaje está validado correctamente, pero este formulario aún no está conectado a un backend. Escríbenos a hola@animotion.studio y lo recibiremos directamente.",
        "info"
      );
      return;
    }

    submitting = true;
    if (submit) {
      submit.classList.add("is-loading");
      submit.setAttribute("aria-busy", "true");
      submit.disabled = true;
    }
    if (submitLabel) submitLabel.textContent = "Enviando…";

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setStatus(
        "Mensaje enviado. Gracias por escribirnos; te responderemos en menos de 48 horas.",
        "success"
      );
      form.reset();
      fields.forEach((field) => setFieldState(field, ""));
      updateCounter();
    } catch (error) {
      const timedOut = error && error.name === "AbortError";
      setStatus(
        timedOut
          ? "El envío tardó demasiado. Inténtalo de nuevo o escríbenos a hola@animotion.studio."
          : "No pudimos enviar el mensaje. Inténtalo de nuevo en unos minutos o escríbenos a hola@animotion.studio.",
        "error"
      );
    } finally {
      window.clearTimeout(timeout);
      submitting = false;
      if (submit) {
        submit.classList.remove("is-loading");
        submit.removeAttribute("aria-busy");
        submit.disabled = false;
      }
      if (submitLabel) submitLabel.textContent = "Enviar mensaje";
    }
  });
}

/* ------------------------------------------------------------------
   16. SISTEMA DE MODALES (FOCO, ESCAPE Y SCROLL)
------------------------------------------------------------------- */
let activeModal = null;
let lastFocusedElement = null;
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableElements(modal) {
  return $$(FOCUSABLE_SELECTOR, modal).filter(
    (element) => element.offsetParent !== null && element.getAttribute("aria-hidden") !== "true"
  );
}

function openModal(modal) {
  if (!modal) return;
  if (activeModal === modal) return;

  if (activeModal) {
    activeModal.classList.remove("is-open");
    activeModal.hidden = true;
  } else {
    lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  }

  modal.hidden = false;
  modal.classList.remove("is-open");
  body.classList.add("modal-open");
  // Fuerza un reflow para que la transición de entrada se reproduzca.
  void modal.offsetWidth;
  modal.classList.add("is-open");
  activeModal = modal;

  window.setTimeout(() => {
    if (activeModal !== modal) return;
    const focusables = getFocusableElements(modal);
    const target = focusables[0] || modal;
    if (target === modal) modal.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  }, 80);
}

function closeModal(modal) {
  if (!modal || !modal.classList.contains("is-open")) return;

  modal.classList.remove("is-open");
  if (activeModal === modal) activeModal = null;
  if (!activeModal) body.classList.remove("modal-open");

  window.setTimeout(() => {
    if (!modal.classList.contains("is-open")) {
      modal.hidden = true;
      if (modal.id === "video-modal") {
        const videoFrame = $("#video-frame", modal);
        if (videoFrame) videoFrame.replaceChildren();
      }
      if (!activeModal) body.classList.remove("modal-open");
    }
  }, 380);

  if (!activeModal && lastFocusedElement && document.contains(lastFocusedElement)) {
    const target = lastFocusedElement;
    lastFocusedElement = null;
    window.setTimeout(() => {
      if (!activeModal) target.focus({ preventScroll: true });
    }, 30);
  }
}

document.addEventListener("keydown", (event) => {
  if (!activeModal) return;

  if (event.key === "Escape") {
    event.preventDefault();
    const modal = activeModal;
    closeModal(modal);
    return;
  }

  if (event.key !== "Tab") return;

  const focusables = getFocusableElements(activeModal);
  if (!focusables.length) {
    event.preventDefault();
    activeModal.focus({ preventScroll: true });
    return;
  }

  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const focusInside = activeModal.contains(document.activeElement);

  if (event.shiftKey && (!focusInside || document.activeElement === first)) {
    event.preventDefault();
    last.focus({ preventScroll: true });
  } else if (!event.shiftKey && (!focusInside || document.activeElement === last)) {
    event.preventDefault();
    first.focus({ preventScroll: true });
  }
});

/* ------------------------------------------------------------------
   17. FOOTER
------------------------------------------------------------------- */
function initFooter() {
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());
}

/* ------------------------------------------------------------------
   18. ARRANQUE
------------------------------------------------------------------- */
function init() {
  initPreloader();
  initParticles();
  initCursor();
  initHeaderAndScroll();
  initMenu();
  initScrollSpy();
  initReveals();
  initCounters();
  initParallax();
  init3DEffects();
  initGallery();
  initVideos();
  initPortfolioFilters();
  initArticleModal();
  initContactForm();
  initFooter();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
