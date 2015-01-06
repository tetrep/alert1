# alert1
## what
Chrome extension that hooks the `alert` function to replace the pop-ups with desktop notifications, notifications may be clicked to get stack traces from when the alert was called.

## install
Download the repo and load it as an unpacked extension. Edit the top box in the extension's options page to contain a JavaScript array of regex strings, i.e. if you want to load the extension on all pages, use `["."]`. Save your settings. Enable/disable (it's disabled by default) the extension via it's icon's pop-up.

After the extension is enabled and succesfully injected into a page once (it needs to pass the regex whitelist), the other options in the options page will popuplate. They will automatically repopulate with defaults (with the exception of the regex whitelist) if they are blank when the extension injects into a page. The extension will only inject into a page if it is enabled and if the pages `window.location` passes the user-provided regex whitelist.

## why
To smooth out alert spam during pen tests. Also, sound effects.

## how
Super hacky, JavaScript must be directly injected into every page (via the DOM) because extensions have a seperate JavaScript context. Then, in order to communicate back, we listen for postMessages that contain a nonce we randomly generated during injection, we post info from those messages to our backgrounded JavaScript. The backgrounded JavaScript takes the messages and displays them as a notification. If a notification is clicked a new window is opened with the stack trace from when the hooked function was called.

We're (semi-)relying upon Chrome's ability to convert functions into valid JavaScript strings to make the injection programmatic, but this is not (afaik) defined behavior and could break whenever the devs feel like it.

## todo
- make options page pretty
- add add more details to notifications/stack traces?
