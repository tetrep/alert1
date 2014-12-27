# alert1
## what
Chrome extension that hooks the `alert` function to replace the pop-ups with desktop notifications, notifications may be clicked to get stack traces from when the alert was called.

## why
To smooth out alert spam during pen tests.

## how
Super hacky, JavaScript must be directly injected into every page (via the DOM) because extensions have a seperate JavaScript context. Then, in order to communicate back, we listen for postMessages that contain a nonce we randomly generated during injection, we post info from those messages to our backgrounded JavaScript. The backgrounded JavaScript takes the messages and displays them as a notification. If a notification is clicked a new window is opened with the stack trace from when the hooked function was called.

We're relying upon Chrome's ability to convert functions into valid JavaScript strings to make the injection programmatic, but this is not (afaik) defined behavior and could break whenever the devs feel like it.
