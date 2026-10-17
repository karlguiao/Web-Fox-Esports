/* =====================================================================
   Web Fox Esports — interactions
   Vanilla JS, no dependencies. Every feature checks that its markup
   exists, so one file serves all five pages.
   ===================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* -------------------------------------------------------------------
     Year in footer
     ------------------------------------------------------------------- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* -------------------------------------------------------------------
     Active nav link
     ------------------------------------------------------------------- */
  var page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  if (page === "") page = "index.html";
  $$(".nav a, .mobile-menu a.mm-link").forEach(function (a) {
    if ((a.getAttribute("href") || "").toLowerCase() === page) a.setAttribute("aria-current", "page");
  });

  /* -------------------------------------------------------------------
     Header: solid after scrolling, hides on the way down
     Scroll progress bar + back-to-top ring
     ------------------------------------------------------------------- */
  var header = $(".site-header");
  var progress = $(".scroll-progress");
  var toTop = $(".to-top");
  var ringBar = toTop ? $(".ring .bar", toTop) : null;
  var lastY = window.scrollY;
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var ratio = max > 0 ? Math.min(y / max, 1) : 0;

    if (header) {
      header.classList.toggle("is-scrolled", y > 24);
      var menuOpen = document.body.classList.contains("is-locked");
      if (!menuOpen) header.classList.toggle("is-hidden", y > lastY && y > 320);
    }
    if (progress) progress.style.transform = "scaleX(" + ratio + ")";
    if (toTop) {
      toTop.classList.toggle("is-visible", y > window.innerHeight * 0.8);
      if (ringBar) ringBar.style.strokeDashoffset = String(150.8 * (1 - ratio));
    }
    lastY = y;
    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* -------------------------------------------------------------------
     Mobile menu
     ------------------------------------------------------------------- */
  var toggle = $(".menu-toggle");
  var menu = $(".mobile-menu");

  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("is-locked", open);
    if (open) {
      header.classList.remove("is-hidden");
      var first = $("a", menu);
      if (first) setTimeout(function () { first.focus(); }, 250);
    }
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) {
        setMenu(false);
        toggle.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 960 && menu.classList.contains("is-open")) setMenu(false);
    });
    // Keep tab focus inside the open menu
    menu.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var items = $$("a, button", menu).concat([toggle]);
      var firstEl = items[0];
      var lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
      else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
    });
  }

  /* -------------------------------------------------------------------
     Intro fold on the home page (once per browser session)
     ------------------------------------------------------------------- */
  var intro = $(".intro");
  if (intro) {
    var seen = false;
    try { seen = sessionStorage.getItem("wfe-intro") === "1"; } catch (e) { seen = true; }
    if (!seen && !reduceMotion) {
      document.documentElement.classList.add("js-intro");
      try { sessionStorage.setItem("wfe-intro", "1"); } catch (e) { /* storage blocked */ }
      setTimeout(function () {
        document.documentElement.classList.remove("js-intro");
        intro.remove();
      }, 2300);
    } else {
      intro.remove();
    }
  }

  /* -------------------------------------------------------------------
     Hero parallax (pointer + scroll), desktop only
     ------------------------------------------------------------------- */
  var heroMedia = $(".hero__media");
  var heroShard = $(".hero__shard");
  if (heroMedia && !reduceMotion) {
    var px = 0, py = 0, tx = 0, ty = 0, sy = 0, raf = null;
    function loop() {
      px += (tx - px) * 0.08;
      py += (ty - py) * 0.08;
      heroMedia.style.transform = "translate3d(" + (px * -14).toFixed(2) + "px," + (py * -10 + sy * 0.25).toFixed(2) + "px,0)";
      if (heroShard) heroShard.style.transform = "translate3d(" + (px * 26).toFixed(2) + "px," + (sy * -0.12).toFixed(2) + "px,0)";
      if (Math.abs(tx - px) > 0.001 || Math.abs(ty - py) > 0.001) raf = requestAnimationFrame(loop);
      else raf = null;
    }
    function kick() { if (!raf) raf = requestAnimationFrame(loop); }
    if (finePointer) {
      window.addEventListener("pointermove", function (e) {
        tx = e.clientX / window.innerWidth - 0.5;
        ty = e.clientY / window.innerHeight - 0.5;
        kick();
      }, { passive: true });
    }
    window.addEventListener("scroll", function () {
      if (window.scrollY < window.innerHeight * 1.2) { sy = window.scrollY; if (!raf) loop(); }
    }, { passive: true });
  }

  /* -------------------------------------------------------------------
     Ticker: duplicate the group so the loop is seamless
     ------------------------------------------------------------------- */
  $$(".ticker__track").forEach(function (track) {
    var group = $(".ticker__group", track);
    if (!group) return;
    var clone = group.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    $$("a", clone).forEach(function (a) { a.setAttribute("tabindex", "-1"); });
    track.appendChild(clone);
  });

  /* -------------------------------------------------------------------
     Count-up numbers
     ------------------------------------------------------------------- */
  var counters = $$("[data-count]");
  function runCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var start = parseFloat(el.getAttribute("data-from") || "0");
    if (reduceMotion) { el.textContent = target; return; }
    var t0 = null, dur = 1600;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(start + (target - start) * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (counters.length && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCounter(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  } else {
    counters.forEach(runCounter);
  }

  /* Footer wordmark: sized to span the container exactly */
  function fitWord() {
    var w = $(".footer-word");
    if (!w) return;
    w.style.fontSize = "100px";
    var natural = w.scrollWidth;
    var avail = w.parentElement.clientWidth - parseFloat(getComputedStyle(w.parentElement).paddingLeft) * 2;
    if (natural > 0) w.style.fontSize = Math.min(220, (100 * avail) / natural) + "px";
  }
  fitWord();
  window.addEventListener("resize", fitWord);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitWord);

  /* Footer wordmark fills in when it scrolls into view */
  var footWord = $(".footer-word");
  if (footWord && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { footWord.classList.add("is-filled"); obs.disconnect(); }
      });
    }, { threshold: 0.8 }).observe(footWord);
  }

  /* -------------------------------------------------------------------
     Tabs (Divisions)
     ------------------------------------------------------------------- */
  $$("[data-tabs]").forEach(function (root) {
    var tabs = $$('[role="tab"]', root);
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (!panel) return;
        panel.hidden = !on;
        if (on) {
          panel.classList.remove("is-entering");
          void panel.offsetWidth;
          panel.classList.add("is-entering");
        }
      });
      if (focus) tab.focus();
      tab.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(t, false); });
      t.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
        if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === "Home") next = tabs[0];
        if (e.key === "End") next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); select(next, true); }
      });
    });
  });

  /* -------------------------------------------------------------------
     News carousel dots (mobile)
     ------------------------------------------------------------------- */
  $$("[data-carousel]").forEach(function (track) {
    var dots = $$("span", document.getElementById(track.getAttribute("data-carousel")));
    if (!dots.length) return;
    track.addEventListener("scroll", function () {
      var cards = track.children;
      var best = 0, bestDist = Infinity;
      for (var i = 0; i < cards.length; i++) {
        var d = Math.abs(cards[i].getBoundingClientRect().left - track.getBoundingClientRect().left);
        if (d < bestDist) { bestDist = d; best = i; }
      }
      dots.forEach(function (d, i) { d.classList.toggle("is-active", i === best); });
    }, { passive: true });
  });

  /* -------------------------------------------------------------------
     Soundtrack player with live visualizer
     ------------------------------------------------------------------- */
  var player = $("[data-player]");
  if (player) {
    var audio = $("audio", player);
    var playBtn = $(".play-btn", player);
    var seek = $(".seek .range", player);
    var vol = $(".volume .range", player);
    var cur = $("[data-current]", player);
    var dur = $("[data-duration]", player);
    var canvas = $("canvas", player);
    var ctx2d = canvas.getContext("2d");
    var actx = null, analyser = null, data = null, silentFrames = 0, synthetic = false;
    var seeking = false;

    function fmt(s) {
      if (!isFinite(s)) return "0:00";
      var m = Math.floor(s / 60), r = Math.floor(s % 60);
      return m + ":" + (r < 10 ? "0" : "") + r;
    }
    function setFill(range) {
      var min = parseFloat(range.min) || 0, max = parseFloat(range.max) || 100;
      range.style.setProperty("--fill", ((range.value - min) / (max - min)) * 100 + "%");
    }

    function sizeCanvas() {
      var r = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(true);
    }

    var bars = 56, levels = new Array(bars).fill(0), tPhase = 0;
    function draw(staticOnly) {
      var w = canvas.clientWidth, h = canvas.clientHeight;
      ctx2d.clearRect(0, 0, w, h);
      var playing = !audio.paused;
      if (playing && analyser && !synthetic) {
        analyser.getByteFrequencyData(data);
        var sum = 0;
        for (var k = 0; k < data.length; k++) sum += data[k];
        silentFrames = sum === 0 ? silentFrames + 1 : 0;
        if (silentFrames > 45) synthetic = true; // e.g. opened from file://
      }
      tPhase += 0.05;
      var gap = 3, bw = (w - gap * (bars - 1)) / bars;
      for (var i = 0; i < bars; i++) {
        var target;
        if (!playing || staticOnly) {
          target = 0.1 + 0.08 * Math.abs(Math.sin(i * 0.42)) + 0.05 * Math.abs(Math.sin(i * 1.3));
        } else if (analyser && !synthetic) {
          var idx = Math.floor(Math.pow(i / bars, 1.6) * (data.length * 0.75));
          target = data[idx] / 255;
        } else {
          target = 0.25 + 0.55 * Math.abs(Math.sin(tPhase * 1.3 + i * 0.35) * Math.cos(tPhase * 0.7 + i * 0.12));
        }
        levels[i] += (target - levels[i]) * 0.25;
        var bh = Math.max(2, levels[i] * h);
        var x = i * (bw + gap);
        var g = ctx2d.createLinearGradient(0, h, 0, h - bh);
        g.addColorStop(0, "#ff6f00");
        g.addColorStop(0.55, "#f5934a");
        g.addColorStop(1, "#feb87e");
        ctx2d.fillStyle = g;
        ctx2d.beginPath();
        ctx2d.moveTo(x, h);
        ctx2d.lineTo(x, h - bh + Math.min(bw * 0.6, 4));
        ctx2d.lineTo(x + Math.min(bw * 0.6, 4), h - bh);
        ctx2d.lineTo(x + bw, h - bh);
        ctx2d.lineTo(x + bw, h);
        ctx2d.closePath();
        ctx2d.fill();
      }
      if (playing && !staticOnly) requestAnimationFrame(function () { draw(false); });
    }

    function setupAudioGraph() {
      if (actx || !(window.AudioContext || window.webkitAudioContext)) return;
      try {
        actx = new (window.AudioContext || window.webkitAudioContext)();
        var src = actx.createMediaElementSource(audio);
        analyser = actx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        data = new Uint8Array(analyser.frequencyBinCount);
        src.connect(analyser);
        analyser.connect(actx.destination);
      } catch (e) {
        synthetic = true;
      }
    }

    playBtn.addEventListener("click", function () {
      if (audio.paused) {
        if (location.protocol !== "file:") setupAudioGraph();
        else synthetic = true;
        if (actx && actx.state === "suspended") actx.resume();
        audio.play().catch(function () {});
      } else {
        audio.pause();
      }
    });

    audio.addEventListener("play", function () {
      player.classList.add("is-playing");
      playBtn.setAttribute("aria-label", "Pause soundtrack");
      draw(false);
    });
    audio.addEventListener("pause", function () {
      player.classList.remove("is-playing");
      playBtn.setAttribute("aria-label", "Play soundtrack");
    });
    audio.addEventListener("loadedmetadata", function () {
      seek.max = audio.duration;
      dur.textContent = fmt(audio.duration);
    });
    audio.addEventListener("timeupdate", function () {
      if (seeking) return;
      seek.value = audio.currentTime;
      cur.textContent = fmt(audio.currentTime);
      setFill(seek);
    });
    audio.addEventListener("ended", function () { audio.currentTime = 0; });

    seek.addEventListener("input", function () {
      seeking = true;
      cur.textContent = fmt(seek.value);
      setFill(seek);
    });
    seek.addEventListener("change", function () {
      audio.currentTime = parseFloat(seek.value);
      seeking = false;
    });
    if (vol) {
      vol.addEventListener("input", function () { audio.volume = vol.value / 100; setFill(vol); });
      setFill(vol);
    }
    if (audio.readyState >= 1) { seek.max = audio.duration; dur.textContent = fmt(audio.duration); }

    window.addEventListener("resize", sizeCanvas);
    sizeCanvas();
  }

  /* -------------------------------------------------------------------
     Highlights video: custom play overlay + missing-file notice
     ------------------------------------------------------------------- */
  $$("[data-video]").forEach(function (wrap) {
    var video = $("video", wrap);
    var btn = $(".video__play", wrap);
    var notice = $(".video__notice", wrap);
    var failed = false;

    var sources = $$("source", video);
    var failures = 0;
    function markFailed() {
      failed = true;
      if (notice) notice.hidden = false;
    }
    sources.forEach(function (s) {
      s.addEventListener("error", function () {
        failures++;
        if (failures >= sources.length) markFailed();
      });
    });
    video.addEventListener("error", markFailed);

    btn.addEventListener("click", function () {
      if (failed || video.networkState === 3) { markFailed(); return; }
      video.controls = true;
      wrap.classList.add("is-started");
      video.play().catch(function () { markFailed(); wrap.classList.remove("is-started"); });
    });
  });

  /* -------------------------------------------------------------------
     Accordion
     ------------------------------------------------------------------- */
  $$("[data-accordion]").forEach(function (root) {
    var items = $$(".acc-item", root);
    items.forEach(function (item) {
      var trig = $(".acc-trigger", item);
      trig.addEventListener("click", function () {
        var open = trig.getAttribute("aria-expanded") === "true";
        items.forEach(function (other) {
          $(".acc-trigger", other).setAttribute("aria-expanded", "false");
          other.classList.remove("is-open");
        });
        if (!open) {
          trig.setAttribute("aria-expanded", "true");
          item.classList.add("is-open");
        }
      });
    });
  });

  /* -------------------------------------------------------------------
     Community tiles: 3D tilt + spotlight, and lightbox
     ------------------------------------------------------------------- */
  var tiles = $$(".tile__btn");
  if (finePointer && !reduceMotion) {
    tiles.forEach(function (t) {
      t.addEventListener("pointermove", function (e) {
        var r = t.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width;
        var y = (e.clientY - r.top) / r.height;
        t.style.setProperty("--mx", x * 100 + "%");
        t.style.setProperty("--my", y * 100 + "%");
        t.style.transform = "rotateX(" + ((0.5 - y) * 7).toFixed(2) + "deg) rotateY(" + ((x - 0.5) * 9).toFixed(2) + "deg)";
      });
      t.addEventListener("pointerleave", function () { t.style.transform = ""; });
    });
  }

  var lb = $(".lightbox");
  if (lb && tiles.length) {
    var lbImg = $(".lightbox__img", lb);
    var lbTitle = $(".lightbox__title", lb);
    var lbCount = $(".lightbox__count", lb);
    var lbLink = $(".lightbox__link", lb);
    var lbClose = $(".lightbox__close", lb);
    var lbIndex = 0;
    var returnFocus = null;

    function show(i) {
      lbIndex = (i + tiles.length) % tiles.length;
      var t = tiles[lbIndex];
      var img = $("img", t);
      lbImg.src = t.getAttribute("data-full") || img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lbTitle.textContent = t.getAttribute("data-title");
      lbCount.textContent = (lbIndex + 1) + " of " + tiles.length;
      lbLink.href = t.getAttribute("data-href");
      lbLink.querySelector("span").textContent = t.getAttribute("data-cta");
    }
    function openLb(i) {
      returnFocus = document.activeElement;
      show(i);
      lb.classList.add("is-open");
      lb.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-locked");
      setTimeout(function () { lbClose.focus(); }, 50);
    }
    function closeLb() {
      lb.classList.remove("is-open");
      lb.setAttribute("aria-hidden", "true");
      document.body.classList.remove("is-locked");
      if (returnFocus) returnFocus.focus();
    }
    tiles.forEach(function (t, i) { t.addEventListener("click", function () { openLb(i); }); });
    lbClose.addEventListener("click", closeLb);
    $("[data-lb-prev]", lb).addEventListener("click", function () { show(lbIndex - 1); });
    $("[data-lb-next]", lb).addEventListener("click", function () { show(lbIndex + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowLeft") show(lbIndex - 1);
      if (e.key === "ArrowRight") show(lbIndex + 1);
      if (e.key === "Tab") {
        var f = $$("button, a", lb);
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
    // Swipe on touch screens
    var sx = null;
    lb.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) show(lbIndex + (dx < 0 ? 1 : -1));
      sx = null;
    });
  }

  /* -------------------------------------------------------------------
     Toast + copy to clipboard
     ------------------------------------------------------------------- */
  var toast = $(".toast");
  var toastTimer = null;
  function showToast(msg) {
    if (!toast) return;
    $("span", toast).textContent = msg;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("is-visible"); }, 2400);
  }

  $$("[data-copy]").forEach(function (btn) {
    var label = $("span", btn);
    var original = label ? label.textContent : "";
    btn.addEventListener("click", function () {
      var value = btn.getAttribute("data-copy");
      function done() {
        btn.classList.add("is-done");
        if (label) label.textContent = "Copied";
        showToast(btn.getAttribute("data-copy-msg") || "Copied to clipboard");
        setTimeout(function () {
          btn.classList.remove("is-done");
          if (label) label.textContent = original;
        }, 2000);
      }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(value).then(done, fallback);
      } else {
        fallback();
      }
      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = value;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); done(); } catch (e) { showToast("Copy failed. Select the text instead."); }
        ta.remove();
      }
    });
  });

  /* Map light/dark toggle */
  var mapToggle = $(".map__toggle");
  if (mapToggle) {
    mapToggle.addEventListener("click", function () {
      var map = mapToggle.closest(".map");
      var light = map.classList.toggle("is-light");
      mapToggle.setAttribute("aria-pressed", String(light));
      $("span", mapToggle).textContent = light ? "Dark map" : "Light map";
    });
  }

  /* -------------------------------------------------------------------
     Membership: plan picker + multi-step registration
     ------------------------------------------------------------------- */
  var form = $("#register-form");
  if (form) {
    var PLANS = {
      trial: { name: "Trial", term: "1 week", price: 0 },
      basic: { name: "Basic", term: "1 month", price: 15 },
      standard: { name: "Standard", term: "3 months", price: 40 },
      premium: { name: "Premium", term: "6 months", price: 75 },
      elite: { name: "Elite", term: "12 months", price: 140 },
      pro: { name: "Pro", term: "Lifetime", price: 300 }
    };
    var planSelect = $("#plan", form);
    var summaryName = $("[data-summary-name]");
    var summaryTerm = $("[data-summary-term]");
    var planCards = $$(".plan");

    function setPlan(key, fromCard) {
      if (!PLANS[key]) return;
      planSelect.value = key;
      planCards.forEach(function (c) {
        var on = c.getAttribute("data-plan") === key;
        c.classList.toggle("is-selected", on);
        var b = $(".btn span", c);
        if (b) b.textContent = on ? "Selected" : "Choose " + PLANS[c.getAttribute("data-plan")].name;
        var btn = $(".btn", c);
        if (btn) btn.setAttribute("aria-pressed", String(on));
      });
      var p = PLANS[key];
      if (summaryName) summaryName.textContent = p.name;
      if (summaryTerm) summaryTerm.textContent = p.term + ", " + (p.price ? "$" + p.price : "free");
      if (fromCard) {
        var target = $("#register");
        if (target) target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      }
    }

    planCards.forEach(function (c) {
      $(".btn", c).addEventListener("click", function () { setPlan(c.getAttribute("data-plan"), true); });
    });
    planSelect.addEventListener("change", function () { setPlan(planSelect.value, false); });

    // Prefill from the URL: membership.html?plan=elite&game=valo
    var params = new URLSearchParams(location.search);
    setPlan(PLANS[params.get("plan")] ? params.get("plan") : "trial", false);
    var gameParam = params.get("game");
    var gameSelect = $("#game", form);
    if (gameParam && gameSelect && $('option[value="' + gameParam + '"]', gameSelect)) gameSelect.value = gameParam;

    // Character counter
    var ta = $("#contribute", form);
    var counter = $("[data-counter]", form);
    if (ta && counter) {
      var maxLen = parseInt(ta.getAttribute("maxlength"), 10);
      var updateCount = function () { counter.textContent = ta.value.length + " / " + maxLen; };
      ta.addEventListener("input", updateCount);
      updateCount();
    }

    var steps = $$(".step", form);
    var dots = $$(".step-dot");
    var backBtn = $("[data-back]", form);
    var nextBtn = $("[data-next]", form);
    var submitBtn = $("[data-submit]", form);
    var current = 0;

    var messages = {
      fullName: "Enter your full name.",
      email: "Enter an email address like name@example.com.",
      phone: "Enter a phone number with at least 7 digits.",
      age: "You need to be 13 or older to join."
    };

    function validateField(input) {
      var field = input.closest(".field");
      var ok = input.checkValidity();
      if (input.id === "phone" && ok) ok = (input.value.match(/\d/g) || []).length >= 7;
      if (field) {
        field.classList.toggle("has-error", !ok);
        var err = $(".error", field);
        if (err && messages[input.id]) err.textContent = messages[input.id];
      }
      input.setAttribute("aria-invalid", String(!ok));
      return ok;
    }

    $$("input[required], select[required]", form).forEach(function (input) {
      input.addEventListener("blur", function () { if (input.value) validateField(input); });
      input.addEventListener("input", function () {
        if (input.closest(".field").classList.contains("has-error")) validateField(input);
      });
    });

    function validateStep(i) {
      var ok = true, firstBad = null;
      $$("input[required], select[required]", steps[i]).forEach(function (input) {
        if (!validateField(input)) { ok = false; if (!firstBad) firstBad = input; }
      });
      if (firstBad) firstBad.focus();
      return ok;
    }

    function labelFor(selectEl) {
      var opt = selectEl.options[selectEl.selectedIndex];
      return opt && opt.value ? opt.text : "Not specified";
    }

    function fillReview() {
      var p = PLANS[planSelect.value];
      var reasons = $$('input[name="reason"]:checked', form).map(function (c) { return c.value; });
      var map = {
        plan: p.name + " (" + p.term + ", " + (p.price ? "$" + p.price : "free") + ")",
        name: $("#fullName", form).value,
        email: $("#email", form).value,
        phone: $("#phone", form).value,
        age: $("#age", form).value,
        reasons: reasons.length ? reasons.join(", ") : "None selected",
        year: labelFor($("#year", form)),
        game: labelFor($("#game", form)),
        contribute: ta.value.trim() || "Not answered"
      };
      Object.keys(map).forEach(function (k) {
        var el = $('[data-review="' + k + '"]', form);
        if (el) el.textContent = map[k];
      });
    }

    function goTo(i, back) {
      steps[current].hidden = true;
      current = i;
      var s = steps[current];
      s.hidden = false;
      s.classList.remove("is-entering", "from-back");
      void s.offsetWidth;
      s.classList.add("is-entering");
      if (back) s.classList.add("from-back");
      dots.forEach(function (d, k) {
        d.classList.toggle("is-done", k < current);
        d.classList.toggle("is-current", k === current);
        if (k === current) d.setAttribute("aria-current", "step"); else d.removeAttribute("aria-current");
      });
      backBtn.hidden = current === 0;
      nextBtn.hidden = current === steps.length - 1;
      submitBtn.hidden = current !== steps.length - 1;
      if (current === steps.length - 1) fillReview();
      var legend = $("legend", s);
      if (legend) { legend.setAttribute("tabindex", "-1"); legend.focus({ preventScroll: true }); }
      var card = $(".form-card");
      if (card && card.getBoundingClientRect().top < 0) card.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    }

    nextBtn.addEventListener("click", function () {
      if (validateStep(current)) goTo(current + 1, false);
    });
    backBtn.addEventListener("click", function () { goTo(current - 1, true); });
    $$("[data-edit]", form).forEach(function (b) {
      b.addEventListener("click", function () { goTo(parseInt(b.getAttribute("data-edit"), 10), true); });
    });

    form.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && e.target.tagName === "INPUT" && current < steps.length - 1) {
        e.preventDefault();
        nextBtn.click();
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      for (var i = 0; i < steps.length - 1; i++) {
        if (!validateStep(i)) { goTo(i, true); validateStep(i); return; }
      }
      var name = $("#fullName", form).value.trim().split(" ")[0];
      var success = $(".success");
      $("[data-success-name]", success).textContent = name;
      $("[data-success-email]", success).textContent = $("#email", form).value;
      $("[data-success-plan]", success).textContent = PLANS[planSelect.value].name;
      form.hidden = true;
      $(".steps").hidden = true;
      success.hidden = false;
      var h = $("h3", success);
      h.setAttribute("tabindex", "-1");
      h.focus();
    });

    var again = $("[data-restart]");
    if (again) {
      again.addEventListener("click", function () {
        form.reset();
        $$(".has-error", form).forEach(function (f) { f.classList.remove("has-error"); });
        setPlan("trial", false);
        if (ta && counter) counter.textContent = "0 / " + ta.getAttribute("maxlength");
        $(".success").hidden = true;
        form.hidden = false;
        $(".steps").hidden = false;
        goTo(0, true);
      });
    }
  }

  /* -------------------------------------------------------------------
     Page transition: ember wipe before leaving for another page
     ------------------------------------------------------------------- */
  var wipe = $(".page-wipe");
  if (wipe && !reduceMotion) {
    document.addEventListener("click", function (e) {
      var a = e.target.closest("a");
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target === "_blank" || a.hasAttribute("download")) return;
      var href = a.getAttribute("href") || "";
      if (!href || href.charAt(0) === "#" || /^(mailto:|tel:|https?:|\/\/)/i.test(href)) return;
      var url = new URL(a.href, location.href);
      if (url.pathname === location.pathname && url.hash) return;
      e.preventDefault();
      wipe.classList.add("is-leaving");
      setTimeout(function () { location.href = a.href; }, 420);
    });
    // Coming back with the browser's back button restores the page from cache
    window.addEventListener("pageshow", function (e) {
      if (e.persisted) wipe.classList.remove("is-leaving");
    });
  }
})();
