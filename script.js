const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
let progress = 0, si = 0;
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
  tl.to(".hero h1 .row span", { y: 0, rotateX: 0, duration: 1.4, stagger: 0.15, ease: "back.out(1.4)" }, 0.2)
    .to(".hero-tag", { opacity: 1, duration: 1 }, 0.5)
    .to(".hero-sub", { opacity: 1, duration: 1 }, 1)
    .to(".hero-actions", { opacity: 1, duration: 1 }, 1.2)
    .to(".hero-meta", { opacity: 1, duration: 1 }, 1.4)
    .set(".hero-avatar", { opacity: 1 }, 0.7)
    .from("#avatarFloat", { scale: 0.4, rotate: -18, y: 80, duration: 1.2, ease: "back.out(1.7)" }, 0.7)
    .from(".avatar-bubble", { scale: 0, transformOrigin: "80% 100%", duration: 0.6, ease: "back.out(2.5)" }, 1.5)
    .from(".avatar-burst", { scale: 0, duration: 0.5, ease: "back.out(3)" }, 1.7)
    .from(".avatar-caption", { x: -40, opacity: 0, duration: 0.6 }, 1.8)
    .add(() => gsap.to(".avatar-panel", { y: -14, duration: 2.8, yoyo: true, repeat: -1, ease: "sine.inOut" }));
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
    el.textContent = original.split("").map((ch, i) => {
      if (ch === " ") return " ";
      if (i < (frame / total) * original.length) return ch;
      return CHARS[Math.floor(Math.random() * CHARS.length)];
    }).join("");
    if (frame >= total) { el.textContent = original; clearInterval(timer); }
  }, 30);
}

/* ============================================================
   3D HERO TEXT — mouse tilt + idle bob
============================================================ */
const h13d = document.getElementById("h13d");
addEventListener("pointermove", (e) => {
  if (reduceMotion) return;
  const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
  gsap.to(h13d, { rotateY: x * 14, rotateX: -y * 10, duration: 0.8, ease: "power2.out", transformPerspective: 1100 });
  gsap.to("#heroAvatar", { x: -x * 26, y: -y * 18, rotateY: -x * 10, rotateX: y * 8, duration: 1, ease: "power2.out", transformPerspective: 1200 });
});
if (!reduceMotion)
  gsap.to(h13d, { y: -8, duration: 2.6, yoyo: true, repeat: -1, ease: "sine.inOut" });

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

/* skew on scroll velocity */
const skewSet = gsap.quickSetter(".skew-wrap", "skewY", "deg");
ScrollTrigger.create({
  onUpdate(self) {
    const v = Math.max(-4, Math.min(4, self.getVelocity() / -450));
    skewSet(v);
    gsap.to(".skew-wrap", { skewY: 0, duration: 0.7, ease: "power3.out", overwrite: true });
  },
});

/* ============================================================
   CURSOR + MAGNETIC
============================================================ */
const dot = document.querySelector(".cursor-dot");
const ring = document.querySelector(".cursor-ring");
const label = document.getElementById("cursorLabel");
let rx = 0, ry = 0;
addEventListener("pointermove", (e) => {
  if (e.pointerType !== "mouse") return;
  dot.style.transform = `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`;
  label.style.left = e.clientX + "px";
  label.style.top = e.clientY + "px";
  rx = e.clientX; ry = e.clientY;
});
(function ringLoop() {
  const cur = ring.getBoundingClientRect();
  const cx = cur.left + cur.width / 2, cy = cur.top + cur.height / 2;
  ring.style.transform = `translate(${cx + (rx - cx) * 0.18}px,${cy + (ry - cy) * 0.18}px) translate(-50%,-50%)`;
  requestAnimationFrame(ringLoop);
})();
function initHoverListeners() {
  document.querySelectorAll(".hoverable, a, button").forEach((el) => {
    el.addEventListener("pointerenter", () => {
      ring.classList.add("hovering");
      if (el.dataset.label) { label.textContent = el.dataset.label; label.style.opacity = 1; }
    });
    el.addEventListener("pointerleave", () => { ring.classList.remove("hovering"); label.style.opacity = 0; });
  });
  document.querySelectorAll(".magnetic").forEach((btn) => {
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      gsap.to(btn, { x: (e.clientX - r.left - r.width / 2) * 0.32, y: (e.clientY - r.top - r.height / 2) * 0.32, duration: 0.4 });
    });
    btn.addEventListener("pointerleave", () => gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,.4)" }));
  });
}

/* ============================================================
   MOBILE NAV
============================================================ */
if ("ontouchstart" in window) {
  window.addEventListener("scroll", () => {
    const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    progFill.style.width = pct * 100 + "%";
    document.getElementById("hudScroll").textContent =
      String(Math.round(pct * 100)).padStart(3, "0") + "%";
  });
}

/* ============================================================
   DATA — fetch & render
============================================================ */
function chips(arr) {
  return arr.map(c => `<span class="chip">${c}</span>`).join("");
}

function renderAll(d) {
  document.getElementById("resumeLink").href = d.meta.resumeUrl;

  // Hero
  document.getElementById("scrambleTag").textContent = d.hero.tag;
  document.getElementById("heroHeadline").innerHTML = d.hero.headline
    .map((t, i) => `<span class="row"><span class="${d.hero.headlineClasses[i]}">${t}</span></span>`)
    .join("");
  document.getElementById("heroSub").innerHTML = d.hero.sub;
  document.getElementById("heroMetaLeft").textContent = d.hero.metaLeft;
  document.getElementById("heroMetaRight").textContent = d.hero.metaRight;

  // Hero 3D row depth
  document.querySelectorAll(".hero h1 .row")
    .forEach((r, i) => (r.style.transform = `translateZ(${i * 38}px)`));

  // About
  document.getElementById("aboutText").innerHTML =
    d.about.paragraphs.map(p => `<p class="reveal">${p}</p>`).join("") +
    `<p class="quote reveal">${d.about.quote}</p>`;
  document.getElementById("statsGrid").innerHTML = d.about.stats
    .map(s => `<div class="stat"><div class="num" data-count="${s.count}">0</div><div class="lbl">${s.label}</div></div>`)
    .join("");

  // Skills
  document.getElementById("skillsGrid").innerHTML = d.skills
    .map(s => `<div class="skill-cat reveal"><div class="cat-badge">${s.badge}</div><h4>${s.heading}</h4><div class="chip-row">${chips(s.chips)}</div></div>`)
    .join("");

  // Experience
  document.getElementById("expList").innerHTML = d.experience.map(e => `
    <div class="exp-item reveal">
      <div>
        <div class="exp-date">${e.dateStart}<br>— ${e.dateEnd}</div>
        <div class="exp-company">${e.company}</div>
      </div>
      <div class="exp-body">
        <h4>${e.role}</h4>
        <ul>${e.bullets.map(b => `<li>${b}</li>`).join("")}</ul>
        <div class="chip-row" style="margin-top:14px">${chips(e.chips)}</div>
      </div>
    </div>`).join("");

  // Projects
  document.getElementById("projectCards").innerHTML = d.projects.map((p, i) => `
    <div class="card hoverable reveal">
      <div class="badge">ISSUE #${String(i + 1).padStart(2, "0")}</div>
      <div class="glyph">${p.glyph}</div>
      <h3>${p.title}</h3>
      <div class="card-meta">${p.meta}</div>
      <p>${p.description}</p>
      <div class="chip-row">${chips(p.chips)}</div>
      ${p.github ? `<a class="card-link hoverable" href="${p.github}" target="_blank" rel="noopener">View on GitHub ↗</a>` : ""}
      ${p.liveUrl ? `<a class="card-link card-link-live hoverable" href="${p.liveUrl}" target="_blank" rel="noopener">View Live ↗</a>` : ""}
    </div>`).join("");

  // Education
  const ed = d.education;
  document.getElementById("eduBlock").innerHTML = `
    <div class="edu-degree">${ed.degree}</div>
    <div class="edu-school">${ed.school}</div>
    <div class="edu-meta">${ed.period}</div>
    <span class="edu-gpa">${ed.gpa}</span>
    <div class="edu-gpa-label">${ed.gpaLabel}</div>
    <div class="chip-row" style="margin-top:20px">${chips(ed.chips)}</div>`;

  // Certifications
  document.getElementById("certGrid").innerHTML = d.certifications.map(c => `
    <div class="cert-card reveal">
      <div class="cert-issuer">${c.issuer} · ${c.date}</div>
      <div class="cert-name">${c.name}</div>
      <a class="cert-verify hoverable" href="${c.verifyUrl}" target="_blank" rel="noopener">Verify ↗</a>
    </div>`).join("");

  // Contact
  const ct = d.contact;
  document.getElementById("contactCta").innerHTML =
    `<a class="btn btn-primary hoverable magnetic" data-label="SEND MAIL!" href="mailto:${ct.email}"><span class="dot"></span> ${ct.email}</a>`;
  document.getElementById("socialRow").innerHTML = `
    <a class="social gh hoverable" href="${ct.github}" target="_blank" rel="noopener">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
      ${ct.githubHandle}
    </a>
    <a class="social li hoverable" href="${ct.linkedin}" target="_blank" rel="noopener">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
      ${ct.linkedinHandle}
    </a>
    <a class="social mail hoverable" href="mailto:${ct.email}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>
      Email Me
    </a>
    <a class="social portfolio hoverable" href="#top">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
      Portfolio Site ↗
    </a>`;
}

function initScrollAnimations() {
  gsap.utils.toArray(".reveal").forEach((el) => {
    gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } });
  });
  gsap.utils.toArray(".flip3d").forEach((el) => {
    gsap.to(el, { opacity: 1, rotateX: 0, y: 0, duration: 1.3, ease: "back.out(1.5)", transformPerspective: 900, scrollTrigger: { trigger: el, start: "top 86%" } });
  });
  gsap.utils.toArray(".num[data-count]").forEach((el) => {
    const target = +el.dataset.count;
    ScrollTrigger.create({
      trigger: el, start: "top 90%", once: true,
      onEnter: () => {
        gsap.fromTo(el, { innerText: 0 }, {
          innerText: target, duration: 2, ease: "power2.out", snap: { innerText: 1 },
          onUpdate() { el.textContent = Math.floor(+el.textContent) + "+"; },
          onComplete() { el.textContent = target + "+"; },
        });
      },
    });
  });
  gsap.utils.toArray(".card").forEach((c, i) => {
    gsap.fromTo(c, { y: 60 * (i % 2 ? 1 : -0.4) }, {
      y: 0,
      scrollTrigger: { trigger: ".cards", start: "top 95%", end: "top 30%", scrub: 1 },
    });
  });
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      card.style.setProperty("--mx", px * 100 + "%");
      card.style.setProperty("--my", py * 100 + "%");
      gsap.to(card, { rotateY: (px - 0.5) * 16, rotateX: (0.5 - py) * 16, duration: 0.5, ease: "power2.out", transformPerspective: 1000 });
    });
    card.addEventListener("pointerleave", () =>
      gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.8, ease: "elastic.out(1,.5)" })
    );
  });
  initHoverListeners();
}

fetch("data.json")
  .then(r => r.json())
  .then(d => { renderAll(d); initScrollAnimations(); ScrollTrigger.refresh(); });
