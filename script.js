const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
gsap.registerPlugin(ScrollTrigger);

/* ============================================================
   DARK MODE
============================================================ */
const darkToggle = document.getElementById("darkToggle");
let dark = false;
darkToggle.addEventListener("click", () => {
  dark = !dark;
  document.body.classList.toggle("dark-mode", dark);
  darkToggle.textContent = dark ? "☀️" : "🌙";
});

/* ============================================================
   LOADER
============================================================ */
const statuses = [
  "COMPILING COMPONENTS…",
  "BUNDLING MODULES…",
  "INTEGRATING AI…",
  "RESOLVING CMS DEPS…",
  "OPTIMISING ASSETS…",
  "DEPLOYING TO PROD…",
  "SHIP IT! 🚀",
];
let progress = 0,
  si = 0;
const loadFill = document.getElementById("loadFill");
const loadStatus = document.getElementById("loadStatus");
const loadInt = setInterval(() => {
  progress = Math.min(100, progress + Math.random() * 14);
  loadFill.style.width = progress + "%";
  if ((progress / 100) * statuses.length > si && si < statuses.length - 1) {
    si++;
    loadStatus.textContent = statuses[si];
  }
  if (progress >= 100) {
    clearInterval(loadInt);
    loadStatus.textContent = statuses[statuses.length - 1];
    setTimeout(launch, 400);
  }
}, 110);

function launch() {
  document.getElementById("loader").classList.add("done");
  if (reduceMotion) return;
  const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
  tl.to(
    ".hero h1 .row span",
    {
      y: 0,
      rotateX: 0,
      duration: 1.4,
      stagger: 0.15,
      ease: "back.out(1.4)",
    },
    0.2,
  )
    .to(".hero-tag", { opacity: 1, duration: 1 }, 0.5)
    .to(".hero-sub", { opacity: 1, duration: 1 }, 1)
    .to(".hero-actions", { opacity: 1, duration: 1 }, 1.2)
    .to(".hero-meta", { opacity: 1, duration: 1 }, 1.4);
  scrambleText(document.getElementById("scrambleTag"));
}

/* ============================================================
   TEXT SCRAMBLE
============================================================ */
const CHARS = "!<>-_\\/[]{}—=+*^?#01";
function scrambleText(el) {
  const original = el.dataset.original || el.textContent;
  el.dataset.original = original;
  let frame = 0;
  const total = 40;
  const timer = setInterval(() => {
    frame++;
    el.textContent = original
      .split("")
      .map((ch, i) => {
        if (ch === " ") return " ";
        if (i < (frame / total) * original.length) return ch;
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      })
      .join("");
    if (frame >= total) {
      el.textContent = original;
      clearInterval(timer);
    }
  }, 30);
}

/* ============================================================
   3D HERO TEXT — mouse tilt + idle bob
============================================================ */
const h13d = document.getElementById("h13d");
document
  .querySelectorAll(".hero h1 .row")
  .forEach((r, i) => (r.style.transform = `translateZ(${i * 38}px)`));
addEventListener("pointermove", (e) => {
  if (reduceMotion) return;
  const x = e.clientX / innerWidth - 0.5,
    y = e.clientY / innerHeight - 0.5;
  gsap.to(h13d, {
    rotateY: x * 14,
    rotateX: -y * 10,
    duration: 0.8,
    ease: "power2.out",
    transformPerspective: 1100,
  });
});
if (!reduceMotion)
  gsap.to(h13d, {
    y: -8,
    duration: 2.6,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut",
  });

/* ============================================================
   SCROLL FX
============================================================ */
gsap.utils.toArray(".reveal").forEach((el) => {
  gsap.to(el, {
    opacity: 1,
    y: 0,
    duration: 1.1,
    ease: "power3.out",
    scrollTrigger: { trigger: el, start: "top 88%" },
  });
});
gsap.utils.toArray(".flip3d").forEach((el) => {
  gsap.to(el, {
    opacity: 1,
    rotateX: 0,
    y: 0,
    duration: 1.3,
    ease: "back.out(1.5)",
    transformPerspective: 900,
    scrollTrigger: { trigger: el, start: "top 86%" },
  });
});
gsap.utils.toArray(".num[data-count]").forEach((el) => {
  const target = +el.dataset.count;
  ScrollTrigger.create({
    trigger: el,
    start: "top 90%",
    once: true,
    onEnter: () => {
      gsap.fromTo(
        el,
        { innerText: 0 },
        {
          innerText: target,
          duration: 2,
          ease: "power2.out",
          snap: { innerText: 1 },
          onUpdate() {
            el.textContent = Math.floor(+el.textContent) + "+";
          },
          onComplete() {
            el.textContent = target + "+";
          },
        },
      );
    },
  });
});

/* skew on scroll velocity */
const skewSet = gsap.quickSetter(".skew-wrap", "skewY", "deg");
ScrollTrigger.create({
  onUpdate(self) {
    const v = Math.max(-4, Math.min(4, self.getVelocity() / -450));
    skewSet(v);
    gsap.to(".skew-wrap", {
      skewY: 0,
      duration: 0.7,
      ease: "power3.out",
      overwrite: true,
    });
  },
});

/* card parallax */
gsap.utils.toArray(".card").forEach((c, i) => {
  gsap.fromTo(
    c,
    { y: 60 * (i % 2 ? 1 : -0.4) },
    {
      y: 0,
      scrollTrigger: {
        trigger: ".cards",
        start: "top 95%",
        end: "top 30%",
        scrub: 1,
      },
    },
  );
});

/* ============================================================
   PROGRESS BAR
============================================================ */
const progFill = document.getElementById("progFill");
ScrollTrigger.create({
  onUpdate(self) {
    progFill.style.width = self.progress * 100 + "%";
    document.getElementById("hudScroll").textContent =
      String(Math.round(self.progress * 100)).padStart(3, "0") + "%";
  },
});

/* ============================================================
   CURSOR + MAGNETIC + CARD TILT
============================================================ */
const dot = document.querySelector(".cursor-dot");
const ring = document.querySelector(".cursor-ring");
const label = document.getElementById("cursorLabel");
let rx = 0,
  ry = 0;
addEventListener("pointermove", (e) => {
  dot.style.transform = `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`;
  label.style.left = e.clientX + "px";
  label.style.top = e.clientY + "px";
  rx = e.clientX;
  ry = e.clientY;
});
(function ringLoop() {
  const cur = ring.getBoundingClientRect();
  const cx = cur.left + cur.width / 2,
    cy = cur.top + cur.height / 2;
  ring.style.transform = `translate(${cx + (rx - cx) * 0.18}px,${cy + (ry - cy) * 0.18}px) translate(-50%,-50%)`;
  requestAnimationFrame(ringLoop);
})();
document.querySelectorAll(".hoverable, a, button").forEach((el) => {
  el.addEventListener("pointerenter", () => {
    ring.classList.add("hovering");
    if (el.dataset.label) {
      label.textContent = el.dataset.label;
      label.style.opacity = 1;
    }
  });
  el.addEventListener("pointerleave", () => {
    ring.classList.remove("hovering");
    label.style.opacity = 0;
  });
});
document.querySelectorAll(".magnetic").forEach((btn) => {
  btn.addEventListener("pointermove", (e) => {
    const r = btn.getBoundingClientRect();
    gsap.to(btn, {
      x: (e.clientX - r.left - r.width / 2) * 0.32,
      y: (e.clientY - r.top - r.height / 2) * 0.32,
      duration: 0.4,
    });
  });
  btn.addEventListener("pointerleave", () =>
    gsap.to(btn, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: "elastic.out(1,.4)",
    }),
  );
});
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width,
      py = (e.clientY - r.top) / r.height;
    card.style.setProperty("--mx", px * 100 + "%");
    card.style.setProperty("--my", py * 100 + "%");
    gsap.to(card, {
      rotateY: (px - 0.5) * 16,
      rotateX: (0.5 - py) * 16,
      duration: 0.5,
      ease: "power2.out",
      transformPerspective: 1000,
    });
  });
  card.addEventListener("pointerleave", () =>
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.8,
      ease: "elastic.out(1,.5)",
    }),
  );
});

/* ============================================================
   MOBILE NAV (hamburger-free: tap logo to scroll top)
============================================================ */
// Touch device scroll progress update
if ("ontouchstart" in window) {
  window.addEventListener("scroll", () => {
    const pct =
      window.scrollY / (document.body.scrollHeight - window.innerHeight);
    progFill.style.width = pct * 100 + "%";
    document.getElementById("hudScroll").textContent =
      String(Math.round(pct * 100)).padStart(3, "0") + "%";
  });
}
