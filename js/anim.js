const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function animateIn(el, preset = "up", delay = 0) {
  if (reduceMotion) {
    el.style.opacity = "1";
    el.style.transform = "none";
    el.style.filter = "none";
    return;
  }

  const options = {
    duration: 800,
    delay,
    easing: "cubic-bezier(.2,.85,.2,1)",
    fill: "both",
  };

  const presets = {
    fade: [
      { opacity: 0 },
      { opacity: 1 }
    ],
    up: [
      { opacity: 0, transform: "translateY(22px)" },
      { opacity: 1, transform: "translateY(0px)" }
    ],
    section: [
      { opacity: 0, transform: "translateY(28px) scale(.992)", filter: "blur(10px)" },
      { opacity: 1, transform: "translateY(0px) scale(1)", filter: "blur(0px)" }
    ],
    lift: [
      { opacity: 0, transform: "translateY(16px) scale(.985)", filter: "blur(8px)" },
      { opacity: 1, transform: "translateY(0px) scale(1)", filter: "blur(0px)" }
    ],
    card: [
      { opacity: 0, transform: "translateY(26px) rotateX(7deg)", transformOrigin: "50% 100%", filter: "blur(10px)" },
      { opacity: 1, transform: "translateY(0px) rotateX(0deg)", filter: "blur(0px)" }
    ],
    title: [
      { opacity: 0, transform: "translateY(14px)", letterSpacing: "0.06em" },
      { opacity: 1, transform: "translateY(0px)", letterSpacing: "0.02em" }
    ],
  };

  const frames = presets[preset] || presets.up;
  el.animate(frames, options); // Element.animate() запускает анимацию напрямую [web:197]
}

function hideInitially(el) {
  if (reduceMotion) return;
  el.style.opacity = "0";
}

function stagger(container, selector, preset, step = 80, startDelay = 0) {
  const items = Array.from(container.querySelectorAll(selector));
  items.forEach((el, i) => {
    hideInitially(el);
    animateIn(el, preset, startDelay + i * step);
  });
}

function setupStickyTopbar() {
  const topbar = document.getElementById("topbar");
  if (!topbar) return;

  const onScroll = () => topbar.classList.toggle("is-stuck", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function setupActiveNav() {
  const navLinks = document.querySelectorAll('.nav__link[href^="#"]');
  const targets = Array.from(navLinks)
    .map(a => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  if (!targets.length) return;

  const io = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;

    const id = visible.target.id;
    navLinks.forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === "#" + id));
  }, { threshold: [0.25, 0.4, 0.6] });

  targets.forEach(t => io.observe(t));
}

function setupScrollReveals() {
  const nodes = document.querySelectorAll("[data-reveal], [data-stagger]");
  nodes.forEach(hideInitially);

  const io = new IntersectionObserver((entries, obs) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;

      const el = entry.target;

      // 1) reveal на самом блоке
      if (el.hasAttribute("data-reveal")) {
        const preset = el.getAttribute("data-reveal") || "up";
        animateIn(el, preset, 0);
      } else {
        // контейнер со stagger можно оставить прозрачным, но “проявить”
        animateIn(el, "fade", 0);
      }

      // 2) stagger для детей
      if (el.hasAttribute("data-stagger")) {
        const mode = el.getAttribute("data-stagger");
        if (mode === "cards") stagger(el, "[data-reveal='card'], .card, .infoCard, .stepCard, .articleItem, .faqItem", "card", 90, 120);
        if (mode === "chips") stagger(el, ".chip, .topicChip, .nav__link, .footerLink", "lift", 45, 80);
      }

      obs.unobserve(el);
    }
  }, {
    threshold: 0.14,
    rootMargin: "0px 0px -12% 0px"
  });

  nodes.forEach(n => io.observe(n)); // IntersectionObserver наблюдает элементы асинхронно [web:183]
}

setupStickyTopbar();
setupActiveNav();
setupScrollReveals();
