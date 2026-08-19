/* ============================================================
   PROWELD ONE — interactions
   Spark simulation, weld-seam scroll rail, reveals, counters,
   print→part slider, nav, badge spin, RFQ demo.
   ============================================================ */
(() => {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- Arc-strike preloader ---------- */
  const loader = $(".arcload");
  if (loader) {
    const done = () => loader.classList.add("done");
    if (reduced || sessionStorage.getItem("pw1-arc")) {
      loader.style.transition = "none";
      done();
    } else {
      sessionStorage.setItem("pw1-arc", "1");
      window.addEventListener("load", () => setTimeout(done, 650), { once: true });
      setTimeout(done, 1800); // hard cap
    }
  }

  /* ---------- Header state ---------- */
  const header = $(".header");
  const onScrollHeader = () => header && header.classList.toggle("is-scrolled", window.scrollY > 24);
  onScrollHeader();

  /* ---------- Mobile nav ---------- */
  const navToggle = $(".nav-toggle");
  const nav = $(".nav");
  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });
    nav.addEventListener("click", (e) => {
      if (e.target.closest("a")) {
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      }
    });
  }

  /* ---------- Weld-seam scroll rail ---------- */
  const seam = $(".seam");
  const seamUpdate = () => {
    if (!seam) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? (window.scrollY / max) * 100 : 0;
    seam.style.setProperty("--p", p.toFixed(2) + "%");
  };
  seamUpdate();

  /* ---------- Scroll velocity (badge spin) ---------- */
  let lastY = window.scrollY;
  let velocity = 0;
  const badges = $$(".ring-badge svg");
  let badgeAngle = 0;

  /* ---------- Unified scroll listener ---------- */
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      onScrollHeader();
      seamUpdate();
      velocity = window.scrollY - lastY;
      lastY = window.scrollY;
      ticking = false;
    });
  }, { passive: true });

  /* Badge spin loop */
  if (badges.length && !reduced) {
    const spin = () => {
      badgeAngle += 0.12 + Math.min(Math.abs(velocity) * 0.045, 2.4);
      velocity *= 0.9;
      badges.forEach(b => (b.style.transform = `rotate(${badgeAngle}deg)`));
      requestAnimationFrame(spin);
    };
    requestAnimationFrame(spin);
  }

  /* ---------- Reveals ---------- */
  const revealEls = $$("[data-reveal]");
  if (revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          const d = en.target.getAttribute("data-delay");
          if (d) en.target.style.transitionDelay = d + "ms";
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(el => io.observe(el));
  }

  /* Steps underline */
  const steps = $$(".step");
  if (steps.length) {
    const sio = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          const idx = steps.indexOf(en.target);
          setTimeout(() => en.target.classList.add("is-in"), idx * 140);
          sio.unobserve(en.target);
        }
      });
    }, { threshold: 0.4 });
    steps.forEach(s => sio.observe(s));
  }

  /* ---------- Count-up stats ---------- */
  $$("[data-count]").forEach(el => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      if (reduced) { el.textContent = target.toFixed(decimals); return; }
      const t0 = performance.now();
      const dur = 1400;
      const tick = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(decimals);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io.observe(el);
  });

  /* ---------- Spark simulation (hero) ---------- */
  const canvas = $(".hero__sparks");
  if (canvas && !reduced) {
    const ctx = canvas.getContext("2d");
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0, running = true, t = 0;
    let pointer = null;
    const parts = [];
    const MAX = window.innerWidth < 760 ? 70 : 150;

    const resize = () => {
      const r = canvas.parentElement.getBoundingClientRect();
      W = canvas.width = Math.floor(r.width * DPR);
      H = canvas.height = Math.floor(r.height * DPR);
    };
    resize();
    window.addEventListener("resize", resize);

    const hero = canvas.closest(".hero");
    hero.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect();
      pointer = { x: (e.clientX - r.left) * DPR, y: (e.clientY - r.top) * DPR };
    });
    hero.addEventListener("pointerleave", () => (pointer = null));

    const vio = new IntersectionObserver((en) => (running = en[0].isIntersecting), { threshold: 0.02 });
    vio.observe(canvas);
    document.addEventListener("visibilitychange", () => (running = !document.hidden && running));

    const spawn = (ex, ey, boost) => {
      if (parts.length >= MAX) return;
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.3;
      const sp = (1.6 + Math.random() * 5.2) * DPR * (boost ? 1.35 : 1);
      parts.push({
        x: ex, y: ey,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 0,
        ttl: 480 + Math.random() * 780,
        w: (0.5 + Math.random() * 1.3) * DPR,
      });
    };

    let emX = 0, emY = 0;
    const frame = (now) => {
      requestAnimationFrame(frame);
      if (!running || document.hidden) return;
      const dt = 16.7;
      t = now;

      // Emitter drifts along a low "seam line", pulled toward pointer
      const baseX = W * (0.5 + 0.3 * Math.sin(now * 0.00019));
      const baseY = H * 0.74;
      const tx = pointer ? pointer.x : baseX;
      const ty = pointer ? Math.min(Math.max(pointer.y, H * 0.3), H * 0.88) : baseY;
      emX += (tx - emX) * 0.06;
      emY += (ty - emY) * 0.06;

      const rate = pointer ? 4 : 2;
      for (let i = 0; i < rate; i++) if (Math.random() < 0.82) spawn(emX, emY, !!pointer);

      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";

      // Arc flicker glow at emitter
      const flick = 0.05 + Math.random() * 0.13 + (Math.random() < 0.03 ? 0.22 : 0);
      const g = ctx.createRadialGradient(emX, emY, 0, emX, emY, 150 * DPR);
      g.addColorStop(0, `rgba(214, 240, 255, ${flick})`);
      g.addColorStop(0.35, `rgba(110, 200, 255, ${flick * 0.45})`);
      g.addColorStop(1, "rgba(110, 200, 255, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(emX, emY, 150 * DPR, 0, Math.PI * 2);
      ctx.fill();

      // White-hot core dot
      ctx.fillStyle = `rgba(255, 252, 244, ${0.5 + Math.random() * 0.5})`;
      ctx.beginPath();
      ctx.arc(emX, emY, (1.6 + Math.random() * 1.6) * DPR, 0, Math.PI * 2);
      ctx.fill();

      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life += dt;
        if (p.life > p.ttl) { parts.splice(i, 1); continue; }
        p.vy += 0.05 * DPR;      // gravity
        p.vx *= 0.995;            // drag
        p.x += p.vx;
        p.y += p.vy;
        if (p.y > H * 0.93 && p.vy > 0) { p.vy *= -0.32; p.vx *= 0.75; } // bounce

        const k = p.life / p.ttl; // 0 → 1
        const alpha = k < 0.7 ? 1 - k * 0.5 : (1 - k) / 0.3 * 0.65;
        const r = 255;
        const gr = Math.round(238 - 148 * k);
        const b = Math.round(210 - 190 * k);
        ctx.strokeStyle = `rgba(${r}, ${gr}, ${b}, ${alpha})`;
        ctx.lineWidth = p.w * (1 - k * 0.5);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 2.4, p.y - p.vy * 2.4);
        ctx.stroke();
      }
      ctx.globalCompositeOperation = "source-over";
    };
    requestAnimationFrame(frame);
  }

  /* ---------- Hero video drop-in ---------- */
  const heroVid = $(".hero__video");
  if (heroVid) {
    heroVid.addEventListener("canplay", () => {
      heroVid.classList.add("is-live");
      heroVid.play().catch(() => {});
    });
    heroVid.addEventListener("error", () => heroVid.remove(), true);
    const src = heroVid.querySelector("source");
    if (src) src.addEventListener("error", () => heroVid.remove());
  }

  /* ---------- Print → Part compare slider ---------- */
  $$(".cmp").forEach(cmp => {
    const range = $("input[type=range]", cmp);
    const set = (v) => cmp.style.setProperty("--pos", Math.min(Math.max(v, 2), 98) + "%");
    if (range) {
      range.addEventListener("input", () => set(range.value));
      set(range.value);
    }
    let dragging = false;
    const fromEvent = (e) => {
      const r = cmp.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      const v = (x / r.width) * 100;
      set(v);
      if (range) range.value = v;
    };
    cmp.addEventListener("pointerdown", (e) => { dragging = true; fromEvent(e); });
    window.addEventListener("pointermove", (e) => dragging && fromEvent(e));
    window.addEventListener("pointerup", () => (dragging = false));
  });

  /* ---------- Magnetic buttons ---------- */
  if (!reduced && matchMedia("(hover: hover)").matches) {
    $$(".btn").forEach(btn => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate(${dx * 0.12}px, ${dy * 0.22}px)`;
      });
      btn.addEventListener("mouseleave", () => (btn.style.transform = ""));
    });
  }

  /* ---------- Work tile image fallback ---------- */
  $$(".work-tile img[data-fallback]").forEach(img => {
    img.addEventListener("error", function onErr() {
      const fb = img.dataset.fallback;
      if (fb && img.src !== fb && !img.dataset.fbTried) {
        img.dataset.fbTried = "1";
        img.src = fb;
      } else {
        img.removeEventListener("error", onErr);
        img.closest(".work-tile").classList.add("is-empty");
      }
    });
  });

  /* ---------- Toast ---------- */
  let toastEl = null, toastTimer = null;
  window.pw1Toast = (msg) => {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    requestAnimationFrame(() => toastEl.classList.add("is-show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-show"), 5200);
  };

  /* ---------- RFQ form (concept demo → mailto) ---------- */
  const rfq = $("#rfq-form");
  if (rfq) {
    const drop = $(".filedrop", rfq);
    const fileInput = $("#rfq-files");
    const fileList = $(".filedrop__list", rfq);
    if (drop && fileInput) {
      drop.addEventListener("click", () => fileInput.click());
      drop.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), fileInput.click()));
      ["dragenter", "dragover"].forEach(ev => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add("is-drag"); }));
      ["dragleave", "drop"].forEach(ev => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove("is-drag"); }));
      drop.addEventListener("drop", (e) => { fileInput.files = e.dataTransfer.files; listFiles(); });
      fileInput.addEventListener("change", listFiles);
      function listFiles() {
        fileList.innerHTML = "";
        [...fileInput.files].forEach(f => {
          const li = document.createElement("span");
          li.textContent = "▸ " + f.name + " (" + (f.size / 1024 / 1024).toFixed(1) + " MB)";
          fileList.appendChild(li);
        });
      }
    }
    rfq.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(rfq);
      const get = (k) => (fd.get(k) || "").toString().trim();
      const files = fileInput && fileInput.files.length
        ? [...fileInput.files].map(f => f.name).join(", ")
        : "none listed";
      const subject = `RFQ — ${get("name") || "New project"}${get("company") ? " / " + get("company") : ""}`;
      const body = [
        "PROWELD ONE — REQUEST FOR QUOTE",
        "--------------------------------",
        `Name:      ${get("name")}`,
        `Company:   ${get("company")}`,
        `Email:     ${get("email")}`,
        `Phone:     ${get("phone")}`,
        `Service:   ${get("service")}`,
        `Material:  ${get("material")}`,
        `Quantity:  ${get("qty")}`,
        `Timeline:  ${get("timeline")}`,
        "",
        "Project notes:",
        get("notes"),
        "",
        `Files to attach: ${files}`,
        "(Please attach your drawings to this email — STEP / IGES / DXF / PDF)",
      ].join("\n");
      window.location.href = `mailto:info@proweldone.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.pw1Toast("Concept demo — opening your email client with the RFQ pre-filled. Production build would deliver files straight to the shop.");
    });
  }

  /* ---------- Footer year ---------- */
  $$("[data-year]").forEach(el => (el.textContent = new Date().getFullYear()));
})();
