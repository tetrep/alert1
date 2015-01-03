alert1.descriptions = {
  scope_whitelist: 'A JavaScript array of strings to be inerpreted as regular expressions, we will only inject code into pages that pass a regex from this list',
  obj_name: 'The name of JavaScript object that will contain the code we\'re injecting into a page. Please keep this in sync with the code below',
  obj_js: 'The JavaScript that makes the object we inject',
  hooked_functions_json: 'An array of objects that will be the target functions of a hook, the function that is the hook, a white list of values that we will hook, and a blacklist of values we will not hook. The blacklist is undefined by default',
  hook_js: 'The function that will be called if a call to the target we\'re hooking passes the whitelist and blacklist we\'ve defined',
  hook_init_js: 'The definition of the function that will be called after we inject into a page'
};
