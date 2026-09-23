/*
 * Shared guest messages ("Words of Blessing").
 *
 * Out of the box, messages are saved only in each visitor's own browser.
 * To make everyone's messages visible to all guests, create a free Firebase
 * project, enable Cloud Firestore, and paste your web app config below.
 * See README.md for the step-by-step and the security rules to use.
 */
window.INVITE_CONFIG = {
  // Background music. Leave as null for the built-in music-box "Happy Birthday",
  // or put an audio file in assets/music/ and set e.g. "assets/music/song.mp3".
  music: null,

  firebase: null
  // firebase: {
  //   apiKey: "…",
  //   authDomain: "your-project.firebaseapp.com",
  //   projectId: "your-project",
  //   appId: "…"
  // }
};
