/* ============================================================
   DEENDAYAL BOYS HOSTEL — script.js
   All interactive behaviour: navbar, gallery, lightbox,
   modal, scroll animations, scroll-to-top, review stars
   ============================================================ */

"use strict";

/* ── HELPERS ─────────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── 1. PRELOADER ────────────────────────────────────────────── */
const preloader = $("#preloader");

window.addEventListener("load", () => {
  setTimeout(() => {
    preloader.classList.add("hidden");
  }, 600);
});

/* ── 2. NAVBAR — Scroll + Mobile Menu ───────────────────────── */
const navbar = $("#navbar");
const hamburger = $("#hamburger");
const navLinks = $("#navLinks");
const allNavLinks = $$(".nav-link");

// Sticky navbar on scroll
window.addEventListener(
  "scroll",
  () => {
    navbar.classList.toggle("scrolled", window.scrollY > 40);
    updateActiveNavLink();
    toggleScrollTopBtn();
  },
  { passive: true },
);

// Hamburger toggle
hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("open");
  navLinks.classList.toggle("open");
  document.body.style.overflow = navLinks.classList.contains("open")
    ? "hidden"
    : "";
});

// Close menu on link click
allNavLinks.forEach((link) => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("open");
    navLinks.classList.remove("open");
    document.body.style.overflow = "";
  });
});

// Close menu on outside click
document.addEventListener("click", (e) => {
  if (!navbar.contains(e.target)) {
    hamburger.classList.remove("open");
    navLinks.classList.remove("open");
    document.body.style.overflow = "";
  }
});

// Active nav link based on scroll position
function updateActiveNavLink() {
  const sections = $$('section[id], div[id="home"]');
  let current = "";

  sections.forEach((sec) => {
    const top = sec.getBoundingClientRect().top;
    if (top <= 100) current = sec.id;
  });

  allNavLinks.forEach((link) => {
    link.classList.toggle(
      "active",
      link.getAttribute("href") === `#${current}`,
    );
  });
}

/* ── 3. SMOOTH SCROLL ───────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const target = document.querySelector(this.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    const offset = navbar.offsetHeight + 16;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  });
});

/* ── 4. SCROLL REVEAL ANIMATIONS ───────────────────────────── */
const revealEls = $$(".reveal-up, .reveal-left, .reveal-right");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
);

revealEls.forEach((el) => revealObserver.observe(el));

/* ── 5. GALLERY LIGHTBOX ────────────────────────────────────── */
const galleryItems = $$(".gallery-item");
const lightbox = $("#lightbox");
const lightboxImg = $("#lightboxImg");
const lightboxCap = $("#lightboxCaption");
const lightboxClose = $("#lightboxClose");
const lightboxPrev = $("#lightboxPrev");
const lightboxNext = $("#lightboxNext");

let currentIndex = 0;

function openLightbox(index) {
  currentIndex = index;
  const item = galleryItems[currentIndex];
  lightboxImg.src = item.querySelector("img").src;
  lightboxImg.alt = item.querySelector("img").alt;
  lightboxCap.textContent = item.dataset.caption || "";
  lightbox.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightbox.classList.remove("active");
  document.body.style.overflow = "";
  // Clear src to prevent flashing on reopen
  setTimeout(() => {
    lightboxImg.src = "";
  }, 350);
}

function showPrev() {
  currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
  const item = galleryItems[currentIndex];
  animateLightboxChange("right");
  lightboxImg.src = item.querySelector("img").src;
  lightboxImg.alt = item.querySelector("img").alt;
  lightboxCap.textContent = item.dataset.caption || "";
}

function showNext() {
  currentIndex = (currentIndex + 1) % galleryItems.length;
  const item = galleryItems[currentIndex];
  animateLightboxChange("left");
  lightboxImg.src = item.querySelector("img").src;
  lightboxImg.alt = item.querySelector("img").alt;
  lightboxCap.textContent = item.dataset.caption || "";
}

function animateLightboxChange(dir) {
  lightboxImg.style.transition = "none";
  lightboxImg.style.transform =
    dir === "left" ? "translateX(30px)" : "translateX(-30px)";
  lightboxImg.style.opacity = "0";
  requestAnimationFrame(() => {
    lightboxImg.style.transition = "transform 0.35s ease, opacity 0.35s ease";
    lightboxImg.style.transform = "translateX(0)";
    lightboxImg.style.opacity = "1";
  });
}

galleryItems.forEach((item, i) => {
  item.addEventListener("click", () => openLightbox(i));
});

lightboxClose.addEventListener("click", closeLightbox);
lightboxPrev.addEventListener("click", showPrev);
lightboxNext.addEventListener("click", showNext);

// Close on backdrop click
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});

// Keyboard navigation
document.addEventListener("keydown", (e) => {
  if (!lightbox.classList.contains("active")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") showPrev();
  if (e.key === "ArrowRight") showNext();
});

// Touch/swipe for lightbox
let touchStartX = 0;
lightbox.addEventListener(
  "touchstart",
  (e) => {
    touchStartX = e.changedTouches[0].screenX;
  },
  { passive: true },
);

lightbox.addEventListener(
  "touchend",
  (e) => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) diff > 0 ? showNext() : showPrev();
  },
  { passive: true },
);

/* ── 6. REVIEW MODAL ────────────────────────────────────────── */
const addReviewBtn = $("#addReviewBtn");
const reviewModal = $("#reviewModal");
const modalClose = $("#modalClose");

if (addReviewBtn && reviewModal) {
  addReviewBtn.addEventListener("click", () => {
    reviewModal.classList.add("active");
    document.body.style.overflow = "hidden";
  });
}

function closeModal() {
  if (!reviewModal) return;
  reviewModal.classList.remove("active");
  document.body.style.overflow = "";
}

if (modalClose) {
  modalClose.addEventListener("click", closeModal);
}

if (reviewModal) {
  reviewModal.addEventListener("click", (e) => {
    if (e.target === reviewModal) closeModal();
  });
}

document.addEventListener("keydown", (e) => {
  if (
    reviewModal &&
    e.key === "Escape" &&
    reviewModal.classList.contains("active")
  )
    closeModal();
});

/* ── 7. STAR PICKER (Review Modal) ──────────────────────────── */
const starPicker = $("#starPicker");
const reviewRatingInput = $("#reviewRating");
const reviewForm = $("#reviewForm");
const starIcons = starPicker ? $$("i", starPicker) : [];

if (starPicker && reviewRatingInput) {
  starIcons.forEach((star, i) => {
    star.addEventListener("mouseenter", () => {
      starIcons.forEach((s, j) => {
        s.className = j <= i ? "fa-solid fa-star" : "fa-regular fa-star";
      });
    });

    star.addEventListener("click", () => {
      starIcons.forEach((s, j) => {
        s.className = j <= i ? "fa-solid fa-star filled" : "fa-regular fa-star";
      });
      starPicker.dataset.rating = i + 1;
      reviewRatingInput.value = i + 1;
    });
  });

  starPicker.addEventListener("mouseleave", () => {
    const rating = parseInt(starPicker.dataset.rating) || 0;
    starIcons.forEach((s, j) => {
      s.className =
        j < rating ? "fa-solid fa-star filled" : "fa-regular fa-star";
    });
  });
}

/* ── 8. SCROLL TO TOP ───────────────────────────────────────── */
const scrollTopBtn = $("#scrollTop");

function toggleScrollTopBtn() {
  scrollTopBtn.classList.toggle("visible", window.scrollY > 500);
}

scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ── 9. CURRENT YEAR IN FOOTER ──────────────────────────────── */
const yearEl = $("#currentYear");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ── 10. REVIEW AVATAR INITIALS ─────────────────────────────── */
// Auto-populate avatar text from data-initials attribute
$$(".review-avatar").forEach((avatar) => {
  const initials = avatar.dataset.initials;
  if (initials) avatar.textContent = initials;
});

/* ── 11. NAV LOGO FALLBACK ──────────────────────────────────── */
// If logo image fails to load, show "DBH" text instead
const navLogoImgs = $$(".nav-logo, .footer-logo");
navLogoImgs.forEach((img) => {
  img.addEventListener("error", function () {
    this.style.display = "none";
    const wrap = this.closest(".nav-logo-wrap, .footer-logo-row");
    if (wrap) {
      const fallback = document.createElement("span");
      fallback.textContent = "DBH";
      fallback.style.cssText =
        "font-family:var(--ff-display);font-weight:700;color:var(--clr-gold);font-size:1rem;letter-spacing:2px;";
      this.parentNode.insertBefore(fallback, this);
    }
  });
});

/* ── 12. HERO BACKGROUND FALLBACK ───────────────────────────── */
// Provide a gradient fallback if hero-bg.jpg is missing
const heroBg = $(".hero-bg");
if (heroBg) {
  const style = heroBg.style.backgroundImage;
  if (style && style !== "none") {
    const testImg = new Image();
    testImg.onerror = () => {
      heroBg.style.backgroundImage = "none";
      heroBg.style.background = `
        linear-gradient(135deg,
          #0a0f1e 0%,
          #0d1525 30%,
          #111a30 60%,
          #0e1520 100%
        )
      `;
    };
    // Extract URL from background-image style
    const urlMatch = style.match(/url\(['"]?([^'"]+)['"]?\)/);
    if (urlMatch) testImg.src = urlMatch[1];
  }
}

/* ── 13. GALLERY IMAGE FALLBACKS ────────────────────────────── */
// If gallery images are missing, show a styled placeholder
const galleryImgs = $$(".gallery-item img");
const galleryPlaceholders = [
  { label: "Private Room", icon: "🛏️" },
  { label: "Common Area", icon: "🛋️" },
  { label: "Study Room", icon: "📚" },
  { label: "Bathroom", icon: "🚿" },
  { label: "Terrace", icon: "🌆" },
  { label: "Dining Area", icon: "🍽️" },
];

galleryImgs.forEach((img, i) => {
  img.addEventListener("error", function () {
    const item = this.closest(".gallery-item");
    const ph = galleryPlaceholders[i] || { label: "Room", icon: "🏠" };

    this.style.display = "none";

    // Create placeholder div
    const placeholder = document.createElement("div");
    placeholder.style.cssText = `
      width:100%; height:100%; min-height:200px;
      display:flex; flex-direction:column;
      align-items:center; justify-content:center; gap:0.5rem;
      background: linear-gradient(135deg, #1a1f2e, #111420);
      color: rgba(201,168,76,0.7);
      font-family: var(--ff-display);
    `;
    placeholder.innerHTML = `
      <span style="font-size:2.5rem">${ph.icon}</span>
      <span style="font-size:0.9rem;font-weight:600;letter-spacing:0.05em;color:rgba(232,230,225,0.5)">${ph.label}</span>
    `;
    item.insertBefore(placeholder, this);
  });
});

/* ── 14. ABOUT IMAGE FALLBACK ───────────────────────────────── */
const aboutImg = $(".about-img-frame img");
if (aboutImg) {
  aboutImg.addEventListener("error", function () {
    const frame = this.closest(".about-img-frame");
    this.style.display = "none";
    frame.style.background =
      "linear-gradient(135deg, #1a1f2e 0%, #0d1220 100%)";
    frame.style.height = "480px";
    frame.style.display = "flex";
    frame.style.alignItems = "center";
    frame.style.justifyContent = "center";
    const msg = document.createElement("p");
    msg.style.cssText =
      "color:rgba(201,168,76,0.5);font-family:var(--ff-display);font-size:1.1rem;text-align:center;padding:2rem;";
    msg.textContent = "Deendayal Boys Hostel — Building a Legacy of Excellence";
    frame.appendChild(msg);
  });
}

/* ── 15. INTERSECTION OBSERVER: Stagger grid cards ──────────── */
// Feature cards stagger on desktop
const featureCards = $$(".feature-card");
featureCards.forEach((card, i) => {
  card.style.transitionDelay = `${(i % 4) * 0.1}s`;
});

/* ── 16. REVIEW FORM SUBMIT STATE ──────────────────────────── */
if (reviewForm) {
  const submitBtn = reviewForm.querySelector(".btn-primary");
  reviewForm.addEventListener("submit", () => {
    if (submitBtn) {
      submitBtn.textContent = "Submitting...";
      submitBtn.disabled = true;
    }
  });
}

/* ── 17. PARALLAX: Very subtle hero background ──────────────── */
const heroSection = $("#home");
window.addEventListener(
  "scroll",
  () => {
    if (!heroSection) return;
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      heroBg &&
        (heroBg.style.transform = `scale(1.05) translateY(${scrolled * 0.15}px)`);
    }
  },
  { passive: true },
);

/* ============================================================
   HERO BACKGROUND SLIDESHOW
   ADD THESE LINES TO THE BOTTOM OF YOUR script.js
   Do NOT replace anything — just paste this at the end.
   ============================================================

   HOW IT WORKS:
   - Reads image list from data-slides attribute on .hero-bg divs
   - Desktop shows .desktop-bg images (landscape)
   - Mobile shows .mobile-bg images (portrait)
   - Changes every 5 seconds with crossfade + subtle zoom
   - Preloads all images for smooth transitions

   HOW TO ADD/REMOVE IMAGES:
   In index.html, find the data-slides attribute and edit the
   pipe-separated list. Example:
   data-slides="images/a.jpg|images/b.jpg|images/c.jpg"
   ============================================================ */

(function () {
  "use strict";

  /* ── Config ─────────────────────────────────────────────── */
  const SLIDE_INTERVAL = 5000; // ms between slides (5 seconds)
  const FADE_DURATION = 1200; // ms for crossfade (matches CSS transition)

  /* ── Setup for one background element ───────────────────── */
  function initSlideshow(el) {
    if (!el) return;

    // Parse image list from data attribute
    const raw = el.getAttribute("data-slides") || "";
    const slides = raw
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);
    if (slides.length === 0) return;

    // Preload all images silently
    slides.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    let current = 0;

    // Apply first image immediately
    el.style.backgroundImage = `url('${slides[0]}')`;
    el.classList.add("zooming");

    if (slides.length === 1) return; // No need to rotate if only 1 image

    setInterval(() => {
      current = (current + 1) % slides.length;

      // Fade out
      el.style.opacity = "0";

      setTimeout(() => {
        // Swap image while invisible
        el.style.backgroundImage = `url('${slides[current]}')`;

        // Restart zoom animation
        el.classList.remove("zooming");
        void el.offsetWidth; // force reflow to restart animation
        el.classList.add("zooming");

        // Fade back in
        el.style.opacity = "1";
      }, FADE_DURATION / 2);
    }, SLIDE_INTERVAL);
  }

  /* ── Init both desktop and mobile backgrounds ───────────── */
  const desktopBg = document.getElementById("heroBgDesktop");
  const mobileBg = document.getElementById("heroBgMobile");

  initSlideshow(desktopBg);
  initSlideshow(mobileBg);
})();
