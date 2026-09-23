(function () {
  "use strict";

  var BIRTH = new Date(1996, 8, 23); // September 23, 1996 (local time)
  var PALETTE = ["#e8c3c8", "#b98a93", "#cdb7de", "#7b5a9e", "#e6a9c0", "#fff8fa"];

  var body = document.body;
  var envelope = document.getElementById("envelope");
  var invitation = document.getElementById("invitation");

  /* ---------------- Floating hearts & flowers ---------------- */
  var HEART = '<svg viewBox="0 0 32 29"><path fill="COLOR" d="M16 29 2.6 15.8A8.2 8.2 0 0 1 16 5.2a8.2 8.2 0 0 1 13.4 10.6Z"/></svg>';
  var FLOWER = '<svg viewBox="0 0 40 40"><g fill="COLOR">' +
    '<ellipse cx="20" cy="9" rx="6.5" ry="9"/><ellipse cx="20" cy="31" rx="6.5" ry="9"/>' +
    '<ellipse cx="9" cy="20" rx="9" ry="6.5"/><ellipse cx="31" cy="20" rx="9" ry="6.5"/>' +
    '<ellipse cx="12.2" cy="12.2" rx="6" ry="8.5" transform="rotate(-45 12.2 12.2)"/>' +
    '<ellipse cx="27.8" cy="27.8" rx="6" ry="8.5" transform="rotate(-45 27.8 27.8)"/>' +
    '<ellipse cx="27.8" cy="12.2" rx="6" ry="8.5" transform="rotate(45 27.8 12.2)"/>' +
    '<ellipse cx="12.2" cy="27.8" rx="6" ry="8.5" transform="rotate(45 12.2 27.8)"/>' +
    '</g><circle cx="20" cy="20" r="5.5" fill="#fff4c7"/></svg>';
  var TULIP = '<svg viewBox="0 0 40 40"><path fill="COLOR" d="M20 26c-7 0-11-5-11-12l5 4 6-10 6 10 5-4c0 7-4 12-11 12Z"/>' +
    '<path d="M20 26v12" stroke="#9fb89a" stroke-width="2.4" stroke-linecap="round"/></svg>';
  var FLOAT_COLORS = ["#e6a9c0", "#b98a93", "#cdb7de", "#9c7bbf", "#f3c6d0", "#fff8fa"];

  (function floaties() {
    var host = document.getElementById("floaties");
    var count = window.innerWidth < 600 ? 16 : 26;
    for (var i = 0; i < count; i++) {
      var kind = i % 3;
      var shape = kind === 0 ? HEART : kind === 1 ? FLOWER : TULIP;
      var color = FLOAT_COLORS[Math.floor(Math.random() * FLOAT_COLORS.length)];
      var el = document.createElement("span");
      var d = 14 + Math.random() * 14;
      el.className = "floaty";
      el.innerHTML = shape.replace("COLOR", color);
      el.style.setProperty("--x", Math.random() * 100 + "vw");
      el.style.setProperty("--s", 14 + Math.random() * 22 + "px");
      el.style.setProperty("--d", d + "s");
      el.style.setProperty("--delay", -Math.random() * d + "s");
      el.style.setProperty("--o", (0.45 + Math.random() * 0.45).toFixed(2));
      el.style.setProperty("--spin", (Math.random() > 0.5 ? 1 : -1) * (10 + Math.random() * 20) + "s");
      if (Math.random() > 0.5) el.firstChild.style.animationDirection = "alternate, reverse";
      host.appendChild(el);
    }
  })();

  /* ---------------- Envelope ---------------- */
  function openInvite() {
    if (body.classList.contains("is-open")) return;
    body.classList.add("is-open");
    invitation.setAttribute("aria-hidden", "false");
    Music.start(); // runs inside the click, so browsers allow autoplay
    setTimeout(function () { confetti(90); heartBurst(24); }, 900);
    setTimeout(function () {
      body.classList.remove("is-sealed");
      document.getElementById("envelope-screen").setAttribute("aria-hidden", "true");
      window.scrollTo(0, 0);
    }, 1700);
  }
  envelope.addEventListener("click", openInvite);
  document.getElementById("open-btn").addEventListener("click", openInvite);

  function heartBurst(n) {
    var host = document.getElementById("confetti");
    for (var i = 0; i < n; i++) {
      var h = document.createElement("span");
      h.className = "burst";
      h.innerHTML = HEART.replace("COLOR", FLOAT_COLORS[i % 5]);
      var a = (Math.PI * 2 * i) / n;
      var r = 120 + Math.random() * 180;
      h.style.setProperty("--tx", Math.cos(a) * r + "px");
      h.style.setProperty("--ty", Math.sin(a) * r + "px");
      h.style.animationDelay = Math.random() * 0.2 + "s";
      host.appendChild(h);
    }
  }

  /* ---------------- Music ---------------- */
  var musicBtn = document.getElementById("music-btn");
  musicBtn.addEventListener("click", function () {
    var playing = Music.toggle();
    musicBtn.classList.toggle("is-paused", !playing);
    musicBtn.setAttribute("aria-pressed", String(playing));
    musicBtn.setAttribute("aria-label", playing ? "Pause music" : "Play music");
  });

  function confetti(n) {
    var host = document.getElementById("confetti");
    for (var i = 0; i < n; i++) {
      var c = document.createElement("i");
      c.style.left = Math.random() * 100 + "vw";
      c.style.background = PALETTE[i % PALETTE.length];
      c.style.animationDuration = 2.4 + Math.random() * 2.4 + "s";
      c.style.animationDelay = Math.random() * 0.8 + "s";
      c.style.transform = "rotate(" + Math.random() * 360 + "deg)";
      if (Math.random() > 0.6) c.style.borderRadius = "50%";
      host.appendChild(c);
    }
    setTimeout(function () { host.innerHTML = ""; }, 6000);
  }

  /* ---------------- Scroll reveal ---------------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------------- Age counter ---------------- */
  function tickAge() {
    var now = new Date();
    var years = now.getFullYear() - BIRTH.getFullYear();
    if (now < new Date(now.getFullYear(), 8, 23)) years--;
    var ms = now - BIRTH;
    document.getElementById("c-years").textContent = years;
    document.getElementById("c-days").textContent = Math.floor(ms / 864e5).toLocaleString();
    document.getElementById("c-hours").textContent = Math.floor(ms / 36e5).toLocaleString();
  }
  tickAge();
  setInterval(tickAge, 60000);

  /* ---------------- Words of Blessing ---------------- */
  var form = document.getElementById("wish-form");
  var nameIn = document.getElementById("wish-name");
  var textIn = document.getElementById("wish-text");
  var list = document.getElementById("wish-list");
  var empty = document.getElementById("wish-empty");
  var status = document.getElementById("wish-status");
  var counter = document.getElementById("char-count");
  var LOCAL_KEY = "kathkath30.wishes";

  textIn.addEventListener("input", function () { counter.textContent = textIn.value.length; });

  function fmtDate(ts) {
    var d = new Date(ts);
    if (isNaN(d)) return "";
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) +
      " · " + d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }

  function render(wishes) {
    list.innerHTML = "";
    wishes.forEach(function (w) {
      var li = document.createElement("li");
      li.className = "wish";
      var head = document.createElement("div");
      head.className = "wish-head";
      var n = document.createElement("span");
      n.className = "wish-name";
      n.textContent = w.name;
      var d = document.createElement("span");
      d.className = "wish-date";
      d.textContent = fmtDate(w.createdAt);
      var t = document.createElement("p");
      t.className = "wish-text";
      t.textContent = w.message;
      head.appendChild(n); head.appendChild(d);
      li.appendChild(head); li.appendChild(t);
      list.appendChild(li);
    });
    empty.hidden = wishes.length > 0;
  }

  // Local (per-browser) store — used when no shared backend is configured.
  var localStore = {
    load: function () {
      try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) || []; } catch (e) { return []; }
    },
    subscribe: function (cb) { cb(this.load()); this._cb = cb; },
    add: function (w) {
      var all = this.load();
      all.unshift(w);
      try { localStorage.setItem(LOCAL_KEY, JSON.stringify(all.slice(0, 200))); } catch (e) {}
      if (this._cb) this._cb(all);
      return Promise.resolve();
    }
  };

  // Shared store via Firebase Firestore, loaded only when configured.
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src; s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function firestoreStore(cfg) {
    var base = "https://www.gstatic.com/firebasejs/10.12.2/";
    return loadScript(base + "firebase-app-compat.js")
      .then(function () { return loadScript(base + "firebase-firestore-compat.js"); })
      .then(function () {
        firebase.initializeApp(cfg);
        var col = firebase.firestore().collection("wishes");
        return {
          subscribe: function (cb) {
            col.orderBy("createdAt", "desc").limit(300).onSnapshot(function (snap) {
              cb(snap.docs.map(function (doc) {
                var d = doc.data();
                return {
                  name: d.name,
                  message: d.message,
                  createdAt: d.createdAt && d.createdAt.toMillis ? d.createdAt.toMillis() : Date.now()
                };
              }));
            }, function () {
              status.textContent = "Couldn't load messages right now. Please refresh in a bit.";
            });
          },
          add: function (w) {
            return col.add({
              name: w.name,
              message: w.message,
              createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
          }
        };
      });
  }

  var cfg = window.INVITE_CONFIG && window.INVITE_CONFIG.firebase;
  var storeReady = cfg
    ? firestoreStore(cfg).catch(function () { return localStore; })
    : Promise.resolve(localStore);

  storeReady.then(function (store) { store.subscribe(render); });

  // Remember the guest's name on this device for convenience.
  try { nameIn.value = localStorage.getItem("kathkath30.name") || ""; } catch (e) {}

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = nameIn.value.trim().replace(/\s+/g, " ").slice(0, 60);
    var message = textIn.value.trim().slice(0, 600);
    if (!name) { status.textContent = "Please add your name so Kath knows who it's from ♡"; nameIn.focus(); return; }
    if (!message) { status.textContent = "Please write a short message."; textIn.focus(); return; }

    var btn = form.querySelector("button");
    btn.disabled = true;
    status.textContent = "Sending…";
    storeReady
      .then(function (store) { return store.add({ name: name, message: message, createdAt: Date.now() }); })
      .then(function () {
        try { localStorage.setItem("kathkath30.name", name); } catch (err) {}
        textIn.value = "";
        counter.textContent = "0";
        status.textContent = "Thank you! Your blessing has been sent ♡";
        confetti(40);
      })
      .catch(function () { status.textContent = "Sorry, that didn't go through. Please try again."; })
      .then(function () { btn.disabled = false; });
  });
})();
