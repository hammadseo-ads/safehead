/* SafeheadBABY redesign — interactions */
(function () {
  "use strict";

  /* ---- mobile nav + mega accordion ---- */
  var burger = document.querySelector(".hamburger");
  var links = document.querySelector(".nav-links");
  if (burger && links) {
    var closeMenu = function () { burger.classList.remove("open"); links.classList.remove("open"); };
    burger.addEventListener("click", function () {
      burger.classList.toggle("open");
      links.classList.toggle("open");
    });
    links.querySelectorAll("a").forEach(function (a) {
      var mega = a.parentElement.classList.contains("has-mega");
      a.addEventListener("click", function (e) {
        if (mega && window.matchMedia("(max-width:760px)").matches) {
          e.preventDefault();               // mobile: expand the Shop submenu instead of navigating
          a.parentElement.classList.toggle("open");
        } else {
          closeMenu();
        }
      });
    });
  }

  /* ---- hero carousel ---- */
  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dotsWrap = document.querySelector(".hero-dots");
  if (slides.length > 1 && dotsWrap) {
    var idx = 0, timer;
    slides.forEach(function (_, i) {
      var b = document.createElement("button");
      if (i === 0) b.classList.add("active");
      b.setAttribute("aria-label", "Go to slide " + (i + 1));
      b.addEventListener("click", function () { go(i); reset(); });
      dotsWrap.appendChild(b);
    });
    var dots = dotsWrap.querySelectorAll("button");
    function go(n) {
      slides[idx].classList.remove("active");
      dots[idx].classList.remove("active");
      idx = (n + slides.length) % slides.length;
      slides[idx].classList.add("active");
      dots[idx].classList.add("active");
    }
    function reset() { clearInterval(timer); timer = setInterval(function () { go(idx + 1); }, 5500); }
    reset();
  }

  /* ---- scroll reveal ---- */
  var revs = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revs.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    revs.forEach(function (el, i) {
      el.style.transitionDelay = (i % 3) * 90 + "ms";
      io.observe(el);
    });
  } else {
    revs.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- gallery lightbox ---- */
  var items = Array.prototype.slice.call(document.querySelectorAll(".ugc-item"));
  var lb = document.querySelector(".lightbox");
  if (items.length && lb) {
    var lbImg = lb.querySelector("img");
    var cur = 0;
    var srcs = items.map(function (it) {
      var im = it.querySelector("img");
      return im.getAttribute("data-full") || im.getAttribute("src");
    });
    function open(i) { cur = i; lbImg.src = srcs[cur]; lb.classList.add("open"); document.body.style.overflow = "hidden"; }
    function close() { lb.classList.remove("open"); document.body.style.overflow = ""; }
    function step(d) { cur = (cur + d + srcs.length) % srcs.length; lbImg.src = srcs[cur]; }
    items.forEach(function (it, i) { it.addEventListener("click", function () { open(i); }); });
    lb.querySelector(".close").addEventListener("click", close);
    lb.querySelector(".prev").addEventListener("click", function (e) { e.stopPropagation(); step(-1); });
    lb.querySelector(".next").addEventListener("click", function (e) { e.stopPropagation(); step(1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });
  }

  /* ---- static form guard (client-review demo, no backend) ---- */
  document.querySelectorAll("form[data-demo]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var note = f.querySelector(".form-note");
      if (note) { note.style.display = "block"; }
      f.reset();
    });
  });
})();

/* ===== added interactions: sticky CTA, awards slider, video, quick view ===== */
(function () {
  "use strict";

  /* sticky mobile CTA — reveal after ~15% scroll */
  var mcta = document.querySelector(".mobile-cta");
  if (mcta) {
    var onScroll = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var pct = h > 0 ? window.scrollY / h : 0;
      if (window.scrollY > window.innerHeight * 0.15 || pct > 0.15) mcta.classList.add("show");
      else mcta.classList.remove("show");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* awards slider arrows */
  document.querySelectorAll(".awards-slider").forEach(function (w) {
    var track = w.querySelector(".awards-track");
    if (!track) return;
    var step = function () { return Math.max(track.clientWidth * 0.8, 220); };
    var prev = w.querySelector(".prev"), next = w.querySelector(".next");
    if (prev) prev.addEventListener("click", function () { track.scrollBy({ left: -step(), behavior: "smooth" }); });
    if (next) next.addEventListener("click", function () { track.scrollBy({ left: step(), behavior: "smooth" }); });
  });

  /* YouTube sound toggle — supports multiple players, only one plays sound at a time */
  var vframes = [].slice.call(document.querySelectorAll(".video-frame"));
  var ytSend = function (frame, fn, args) {
    var y = frame.querySelector(".yt-embed");
    if (!y) return;
    try { y.contentWindow.postMessage(JSON.stringify({ event: "command", func: fn, args: args || [] }), "*"); } catch (e) {}
  };
  var setSound = function (frame, on) {
    var b = frame.querySelector(".video-sound");
    if (!b) return;
    ytSend(frame, on ? "unMute" : "mute");
    if (on) { ytSend(frame, "setVolume", [100]); ytSend(frame, "playVideo"); }
    b.classList.toggle("on", on);
    b.querySelector(".ic").textContent = on ? "🔊" : "🔇";
    b.querySelector(".lbl").textContent = on ? "Sound on" : "Tap for sound";
  };
  vframes.forEach(function (frame) {
    var b = frame.querySelector(".video-sound");
    if (!b) return;
    b.addEventListener("click", function () {
      var turnOn = !b.classList.contains("on");
      if (turnOn) vframes.forEach(function (f) { if (f !== frame) setSound(f, false); });
      setSound(frame, turnOn);
    });
  });

  /* product quick view */
  var qv = document.getElementById("qvModal");
  var pdEl = document.getElementById("prodData");
  if (qv && pdEl) {
    var pdata = {};
    try { pdata = JSON.parse(pdEl.textContent); } catch (e) {}
    var open = function (id) {
      var p = pdata[id];
      if (!p) return;
      var img = qv.querySelector(".qv-media img");
      img.src = "/assets/img/" + p.img; img.alt = p.name;
      qv.querySelector(".qv-tag").textContent = p.tag;
      qv.querySelector(".qv-name").textContent = p.name;
      qv.querySelector(".qv-desc").textContent = p.desc;
      var ul = qv.querySelector(".qv-points"); ul.innerHTML = "";
      (p.points || []).forEach(function (pt) { var li = document.createElement("li"); li.innerHTML = pt; ul.appendChild(li); });
      qv.classList.add("open"); qv.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden";
    };
    var close = function () { qv.classList.remove("open"); qv.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; };
    document.querySelectorAll(".qv").forEach(function (b) {
      b.addEventListener("click", function () { open(b.getAttribute("data-prod")); });
    });
    qv.querySelector(".qv-close").addEventListener("click", close);
    qv.addEventListener("click", function (e) { if (e.target === qv) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && qv.classList.contains("open")) close(); });
  }

  /* review filter tabs (All / Parents / Experts) */
  document.querySelectorAll(".rv-tabs").forEach(function (tabs) {
    var section = tabs.closest("section");
    var cards = section ? [].slice.call(section.querySelectorAll(".rv-card")) : [];
    tabs.querySelectorAll(".rv-tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.querySelectorAll(".rv-tab").forEach(function (t) { t.classList.remove("active"); });
        tab.classList.add("active");
        var f = tab.getAttribute("data-filter");
        cards.forEach(function (c) {
          var show = f === "all" || c.getAttribute("data-cat") === f;
          c.classList.toggle("hide", !show);
        });
      });
    });
  });

  /* welcome popup — shows once per session, after a short delay */
  var pop = document.getElementById("promoPop");
  if (pop && !sessionStorage.getItem("shpop")) {
    var hidePop = function () { pop.classList.remove("open"); sessionStorage.setItem("shpop", "1"); };
    setTimeout(function () { pop.classList.add("open"); }, 2500);
    pop.querySelector(".promo-close").addEventListener("click", hidePop);
    pop.querySelector(".promo-dismiss").addEventListener("click", hidePop);
    pop.addEventListener("click", function (e) { if (e.target === pop) hidePop(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && pop.classList.contains("open")) hidePop(); });
  }

  /* collection filter */
  document.querySelectorAll(".shop-tabs").forEach(function (tabs) {
    var grid = document.querySelector(".shop-grid");
    var cards = grid ? [].slice.call(grid.querySelectorAll(".shop-card")) : [];
    tabs.querySelectorAll(".shop-tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.querySelectorAll(".shop-tab").forEach(function (t) { t.classList.remove("active"); });
        tab.classList.add("active");
        var f = tab.getAttribute("data-filter");
        cards.forEach(function (c) {
          c.classList.toggle("hide", !(f === "all" || c.getAttribute("data-cat") === f));
        });
      });
    });
  });

  /* product page: gallery, quantity, add-to-cart demo */
  var pvMain = document.getElementById("pvMain");
  if (pvMain) {
    document.querySelectorAll(".pv-thumb").forEach(function (t) {
      t.addEventListener("click", function () {
        document.querySelectorAll(".pv-thumb").forEach(function (x) { x.classList.remove("active"); });
        t.classList.add("active");
        pvMain.src = t.getAttribute("data-img");
      });
    });
    var qtyInput = document.getElementById("pvQty");
    document.querySelectorAll(".qty-btn").forEach(function (b) {
      b.addEventListener("click", function () {
        var v = (parseInt(qtyInput.value, 10) || 1) + parseInt(b.getAttribute("data-d"), 10);
        qtyInput.value = Math.max(1, v);
      });
    });
    var pvNote = document.querySelector(".pv-note");
    document.querySelectorAll(".pv-cart, .pv-wish").forEach(function (b) {
      b.addEventListener("click", function () { if (pvNote) pvNote.classList.add("show"); });
    });
  }
})();
