# X Clean Link

A Chrome extension that removes tracking parameters from post and profile links copied on X (Twitter).

```
https://x.com/example_handle/status/1234567890123456789?a=AbCdEfGhIjKlMnOpQrS&s=20
→ https://x.com/example_handle/status/1234567890123456789
```

## Install

1. Open `chrome://extensions` and turn on **Developer mode**.
2. Click **Load unpacked** and select this folder.
3. Reload any X tabs that are already open.

## What gets cleaned

The clipboard text must be exactly one `https` URL on `x.com` or `twitter.com` (including `www.` and `mobile.`). The query and fragment are removed from these paths:

| Type | Paths |
|---|---|
| Post | `/<handle>/status/<id>`, `/i/status/<id>`, `/i/web/status/<id>`, with optional `/photo/N` or `/video/N` |
| Profile | `/<handle>` |

Everything else stays as it is, including search, list, Spaces, intent and compose links, profile tabs such as `/<handle>/media`, `t.co` links, and text that contains a URL among other words. The host is never changed, so `twitter.com` links stay on `twitter.com`.

Copying a matching URL by hand with Ctrl+C also cleans it, unless the selection includes an image or other media.

## Limits

These bypass the page's clipboard calls, so the extension can't clean them:

- The browser's **Copy link address** menu
- Copying from the address bar
- The system share sheet (`navigator.share`)
- The X mobile app

## Test

```bash
node --test
```

## If links stop being cleaned

X may have changed how it copies links. Open DevTools on x.com, paste this into the console, then use **Share > Copy link**:

```js
// Run after the page has loaded. Logs what X sends, before the extension cleans it.
for (const name of ['writeText', 'write']) {
  const original = Clipboard.prototype[name];
  Clipboard.prototype[name] = function (...args) {
    console.log('clipboard.' + name, args);
    return original.apply(this, args);
  };
}
window.addEventListener('copy', () => console.log('copy event', String(getSelection())), true);
```

How to read the result:

| Console shows | Meaning |
|---|---|
| `clipboard.writeText` with a query | Normal, because this log comes before cleaning. If the pasted link is still dirty, check that the extension is on and the tab was reloaded, then check that `src/clean.js` supports the URL's path. |
| `clipboard.write` or `copy event` | X changed how it copies. `src/hook.js` needs to cover the new path. |
| Nothing | X is using a path the snippet can't see, possibly through a function reference saved at page load. |
