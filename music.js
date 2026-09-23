/*
 * Background music for the invitation.
 *
 * If config.js sets `music` to an audio file (e.g. "assets/music/song.mp3"),
 * that file is played on a loop. Otherwise a soft music-box waltz of
 * "Happy Birthday to You" is synthesized in the browser, so no file is needed.
 *
 * Music.start() must be called from a click so browsers allow it to play.
 */
window.Music = (function () {
  "use strict";

  var BEAT = 0.62;        // seconds per beat (about 97 bpm, a gentle waltz)
  var LOOP_BEATS = 27;    // 24 beats of melody + a short breath before repeating
  var VOLUME = 0.32;

  // [beat, note, length in beats]
  var MELODY = [
    [0, "G4", .75], [.75, "G4", .25], [1, "A4", 1], [2, "G4", 1], [3, "C5", 1], [4, "B4", 2],
    [6, "G4", .75], [6.75, "G4", .25], [7, "A4", 1], [8, "G4", 1], [9, "D5", 1], [10, "C5", 2],
    [12, "G4", .75], [12.75, "G4", .25], [13, "G5", 1], [14, "E5", 1], [15, "C5", 1], [16, "B4", 1], [17, "A4", 1],
    [18, "F5", .75], [18.75, "F5", .25], [19, "E5", 1], [20, "C5", 1], [21, "D5", 1], [22, "C5", 3]
  ];
  // One chord per bar: [bar start, bass, chord tones] played as "oom-pah-pah".
  var CHORDS = [
    [1, "C3", ["E4", "G4"]], [4, "G2", ["B3", "D4"]], [7, "G2", ["B3", "F4"]], [10, "C3", ["E4", "G4"]],
    [13, "C3", ["E4", "G4"]], [16, "F2", ["A3", "C4"]], [19, "G2", ["B3", "D4"]], [22, "C3", ["E4", "G4"]]
  ];

  var SEMITONES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function freq(note) {
    var midi = 12 * (parseInt(note.slice(-1), 10) + 1) + SEMITONES[note[0]];
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  var ctx, master, reverb, timer, nextLoopAt, playing = false;
  var audioEl = null;

  function makeReverb() {
    var len = ctx.sampleRate * 2.2;
    var buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var c = 0; c < 2; c++) {
      var data = buf.getChannelData(c);
      for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
    var conv = ctx.createConvolver();
    conv.buffer = buf;
    return conv;
  }

  // A music-box "pling": a bright sine with a quiet octave overtone and a fast decay.
  function pluck(note, when, length, gain) {
    var f = freq(note);
    var env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, when);
    env.gain.exponentialRampToValueAtTime(gain, when + 0.012);
    env.gain.exponentialRampToValueAtTime(0.0001, when + Math.max(0.9, length * BEAT * 1.6));
    env.connect(master);
    env.connect(reverb);

    [[f, 1], [f * 2, 0.25], [f * 3, 0.06]].forEach(function (p) {
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = p[0];
      g.gain.value = p[1];
      osc.connect(g).connect(env);
      osc.start(when);
      osc.stop(when + Math.max(1, length * BEAT * 1.7));
    });
  }

  function scheduleLoop(t0) {
    MELODY.forEach(function (n) { pluck(n[1], t0 + n[0] * BEAT, n[2], 0.5); });
    CHORDS.forEach(function (c) {
      pluck(c[1], t0 + c[0] * BEAT, 1, 0.32);
      for (var b = 1; b <= 2; b++) {
        c[2].forEach(function (tone) { pluck(tone, t0 + (c[0] + b) * BEAT, 0.6, 0.1); });
      }
    });
  }

  // Schedule one loop ahead so playback never gaps.
  function pump() {
    while (nextLoopAt < ctx.currentTime + 2) {
      scheduleLoop(nextLoopAt);
      nextLoopAt += LOOP_BEATS * BEAT;
    }
  }

  function startSynth() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    if (!ctx) {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);
      reverb = makeReverb();
      var wet = ctx.createGain();
      wet.gain.value = 0.35;
      reverb.connect(wet).connect(master);
    }
    ctx.resume();
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(VOLUME, ctx.currentTime, 0.4);
    if (!timer) {
      nextLoopAt = ctx.currentTime + 0.15;
      pump();
      timer = setInterval(pump, 500);
    }
    return true;
  }

  function pauseSynth() {
    if (!ctx) return;
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
    clearInterval(timer);
    timer = null;
    setTimeout(function () { if (!playing) ctx.suspend(); }, 600);
  }

  function showButton() {
    var btn = document.getElementById("music-btn");
    if (btn) btn.hidden = false;
  }

  function start() {
    if (playing) return;
    playing = true;
    var file = window.INVITE_CONFIG && window.INVITE_CONFIG.music;
    if (file) {
      audioEl = audioEl || new Audio(file);
      audioEl.loop = true;
      audioEl.volume = 0.6;
      audioEl.play().then(showButton).catch(function () {
        audioEl = null; // file missing or blocked: fall back to the music box
        if (startSynth()) showButton();
      });
      return;
    }
    if (startSynth()) showButton();
  }

  function toggle() {
    if (playing) {
      playing = false;
      if (audioEl) audioEl.pause(); else pauseSynth();
    } else {
      playing = true;
      if (audioEl) audioEl.play(); else startSynth();
    }
    return playing;
  }

  return { start: start, toggle: toggle };
})();
