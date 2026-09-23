# Trentahin na si Kath Kath

A digital 30th birthday invitation for **Katherine Joy C. Estrella** (born September 23, 1996).

Guests open an envelope, which reveals the invitation: her portrait, Proverbs 31:25 and a quote from
St. Catherine of Siena, who she is to everyone, the three things she is known for
(masipag, masikap, may paninindigan), the event details, and a **Words of Blessing** wall where anyone
can leave a message. No login is needed, only a name.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The page and all of its text |
| `styles.css` | Blush pink and purple theme |
| `script.js` | Envelope animation, confetti, age counter, messages |
| `config.js` | Optional shared-messages backend (Firebase) |
| `assets/img/` | Photos |

## Editing the event details

In `index.html`, find the elements with `data-edit="time"` and `data-edit="venue"` and replace
"To be announced" with the real time and venue.

## Publishing with GitHub Pages

Go to **Settings → Pages**, choose **Deploy from a branch**, then pick the branch and `/ (root)`.

## Making the messages visible to everyone

Without a backend, the page has nowhere to share messages, so each message is saved only in the
browser of the guest who wrote it. To show every guest's messages to everyone:

1. Create a free project at <https://console.firebase.google.com>, add a **Web app**, and enable
   **Cloud Firestore**.
2. Paste the web app's config into `config.js` (replace `firebase: null`).
3. In Firestore, open **Rules** and use these rules, which allow anyone to read and post a message
   but not to edit or delete one:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /wishes/{id} {
      allow read: if true;
      allow create: if request.resource.data.keys().hasOnly(['name', 'message', 'createdAt'])
        && request.resource.data.name is string
        && request.resource.data.name.size() > 0 && request.resource.data.name.size() <= 60
        && request.resource.data.message is string
        && request.resource.data.message.size() > 0 && request.resource.data.message.size() <= 600
        && request.resource.data.createdAt == request.time;
      allow update, delete: if false;
    }
  }
}
```

You can remove unwanted messages from the Firebase console.
