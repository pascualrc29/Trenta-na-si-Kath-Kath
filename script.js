(function () {
  "use strict";

  var BIRTH = new Date(1996, 8, 23); // September 23, 1996 (local time)
  var PALETTE = ["#e8c3c8", "#b98a93", "#cdb7de", "#7b5a9e", "#e6a9c0", "#fff8fa"];

  var body = document.body;
  var envelope = document.getElementById("envelope");
  var invitation = document.getElementById("invitation");

  /* ---------------- Envelope ---------------- */
  (function sparkles() {
    var host = document.querySelector(".sparkles");
    for (var i = 0; i < 40; i++) {
      var s = document.createElement("i");
      s.style.left = Math.random() * 100 + "%";
      s.style.top = Math.random() * 100 + "%";
      s.style.animationDelay = Math.random() * 3 + "s";
      host.appendChild(s);
    }
  })();

  function openInvite() {
    if (body.classList.contains("is-open")) return;
    body.classList.add("is-open");
    invitation.setAttribute("aria-hidden", "false");
    setTimeout(function () { confetti(90); }, 900);
    setTimeout(function () {
      body.classList.remove("is-sealed");
      document.getElementById("envelope-screen").setAttribute("aria-hidden", "true");
      window.scrollTo(0, 0);
    }, 1700);
  }
  envelope.addEventListener("click", openInvite);

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
