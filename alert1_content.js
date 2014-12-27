alert1 = {
  hooked_functions : [],

  hook_function: function (func_old_in, func_old_scope, func_new_in, func_new_scope, hook_whitelist_check_in, whitelist_in, hook_blacklist_check_in, blacklist_in) {
    var hooked_function = {
      func_old: func_old_in,
      func_new: func_new_in,
      func_hook: this.default_func_hook,
      settings: {
        hook_whitelist_check: false,
        whitelist: [],
        hook_blacklist_check: false,
        blacklist: []
      }
    }

    //give scope to functions
    hooked_function.func_old = hooked_function.func_old.bind(func_old_scope);
    hooked_function.func_new = hooked_function.func_new.bind(func_new_scope);
    hooked_function.func_hook = hooked_function.func_hook.bind(hooked_function);

    if (hook_whitelist_check_in) { hooked_function.settings.hook_whitelist_check = hook_whitelist_check_in; }
    if (whitelist_in) { hooked_function.settings.whitelist = whitelist_in; }

    if (hook_blacklist_check_in) { hooked_function.settings.hook_blacklist_check = hook_blacklist_check_in; }
    if (blacklist_in) { hooked_function.settings.blacklist = blacklist_in; }

    this.hooked_functions.push(hooked_function);
    return hooked_function;
  },

  default_func_hook: function (input) {
    var whitelist_pass = true;
    var blacklist_pass = true;

    //check whitelist
    if (this.settings.hook_whitelist_check) {
      if (-1 == this.settings.whitelist.indexOf(input))
      { whitelist_pass = false; }
    }
    //check blacklist
    if (this.settings.hook_blacklist_check) {
      if (-1 != this.settings.blacklist.indexOf(input))
      { blacklist_pass = false; }
    }

    //only hook if we passed whitelist and blacklist
    if (whitelist_pass && blacklist_pass) {
      return this.func_new(input);
    }
    //we don't want to hook this input
    else {
      return this.func_old(input);
    }
  },

  get_stack_trace: function () {
    return (new Error('stack trace: '+Math.random().toString())).stack;
  },

  make_chrome_notification: function (st) {
    chrome.runtime.sendMessage({stack_trace: st}, function(){});
  }
};

//alert = alert1.hook_function(alert, this, alert1.make_chrome_notification, alert1, true, [1]);
//alert(1);

//listen for stack traces
nonce = Math.random().toString();
window.addEventListener("message", function(event) {
  // We only accept messages from ourselves
  if (event.source != window)
    return;

  if (nonce == event.data.nonce) {
    alert1.make_chrome_notification(event.data.stack_trace);
  }
}, false);

s = '';
s += 'var get_stack_trace = function () { e = new Error(\'stack trace: \'+Math.random().toString()); return e.stack; }\n';
s += 'var nonce = '+nonce+';\n';
s += 'var clsr = function (st, msg) { window.postMessage({ nonce: nonce, stack_trace: st, org_msg: msg}, "*");};\n';
s += 'var hook = function(msg) { clsr(get_stack_trace(), msg); };\n';
s += 'alert = hook;\n';
//s += 'alert(1);'
document.body.appendChild(document.createElement('script')).innerHTML=s;
