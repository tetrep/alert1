# alert1
## what
Chrome extension that hooks the `alert` function to replace the pop-ups with desktop notifications, notifications may be clicked to get stack traces from when the alert was called, as well as the window.location that created the `alert`.

Current known limitation is that dynmaic iframes are not supported.

## install
heh...

- the repository is an unpacked extension, load it as such
- in the options page set the first text box to a JavaScript array of regex strings to match against `window.location`, e.g. `["."]` will cause the extension to inject into all pages
- enable the extension via its pop-up (click its icon in the top right)
- after successfully injecting into a page, the extension will populate the options page with its defaults (probably best not to change any of these unless you know what you're doing)

## how
Super hacky, JavaScript must be directly injected into every page (via the DOM) because extensions have a seperate JavaScript context. Then, in order to communicate back, we listen for postMessages that contain a nonce we randomly generated during injection, we post info from those messages to our backgrounded JavaScript. The backgrounded JavaScript takes the messages and displays them as a notification. If a notification is clicked a new window is opened with the stack trace from when the hooked function was called.

We're (semi-)relying upon Chrome's ability to convert functions into valid JavaScript strings to make the injection programmatic, but this is not (afaik) defined behavior and could break whenever the devs feel like it.

To deal with the async-only API that is Chrome's localStorage, we need to ALWAYS inject into pages, even if we don't care about the page. We hook `alert` to build a queue of alert calls, which we then process after we have loaded our settings from localStorage.

## todo
- fully automate object naming to gurantee no collisions
- make options page pretty
- add add more details to notifications/stack traces?
- cleanup content.js
- add dev mode to better troubleshoot potential issues caused by the extension (without needing to modify the extension itself)
- make install simple, obvious, not shitty, etc
- load default options from file for small performance boost when injecting
- support for dynamic iframes? would probably be disgustingly hacky and intrusive, at best
