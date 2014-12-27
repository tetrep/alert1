alert1 = {
  hook_function: function (func_old_in, func_old_scope, func_new_in, func_new_scope, hook_whitelist_check_in, whitelist_in, hook_blacklist_check_in, blacklist_in) {
    var hooked_function = {
      func_old: func_old_scope[func_old_in],
      func_new: func_new_scope[func_new_in],
      func_hook: this.default_func_hook,
      settings: {
        hook_whitelist_check: false,
        whitelist: [],
        hook_blacklist_check: false,
        blacklist: []
      }
    };

    //give scope to functions
    hooked_function.func_old = hooked_function.func_old.bind(func_old_scope);
    hooked_function.func_new = hooked_function.func_new.bind(func_new_scope);
    hooked_function.func_hook = hooked_function.func_hook.bind(hooked_function);

    if (hook_whitelist_check_in) { hooked_function.settings.hook_whitelist_check = hook_whitelist_check_in; }
    if (whitelist_in) { hooked_function.settings.whitelist = whitelist_in; }

    if (hook_blacklist_check_in) { hooked_function.settings.hook_blacklist_check = hook_blacklist_check_in; }
    if (blacklist_in) { hooked_function.settings.blacklist = blacklist_in; }

    //actually hook the function
    func_old_scope[func_old_in] = hooked_function.func_hook;

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
      console.log('calling new function');
      return this.func_new(input);
    }
    //we don't want to hook this input
    else {
      console.log('calling old function');
      return this.func_old(input);
    }
  },

  get_stack_trace: function () {
    return (new Error('stack trace: '+Math.random().toString())).stack;
  },

  make_chrome_notification: function () {
    chrome.runtime.sendMessage({stack_trace: this.get_stack_trace()}, function(){});
  }
};

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

//init string of JavaScript to inject
s = '';

//we want to inject most of alert1
alert1_keys = Object.keys(alert1);
var i = 0;
s += 'var alert1 = {};\n';
for (i = 0; i < alert1_keys.length; i++)
{
  var key = alert1_keys[i];
  var val = alert1[alert1_keys[i]].toString();

  //we won't use this, so don't inject it
  if(key != 'make_chrome_notification') {
    //console.log("found key: "+key);
    //console.log("found val: "+val);
    //console.log(val);
    s += 'alert1[\''+key+'\'] = '+val+'\n';
  }
}

//make a nonce so it's harder for pages to fuck with us
s += 'var nonce = '+nonce+';\n';
//we need to postmessage to ourselves to go from page -> content script
s += 'var clsr = function (msg) { window.postMessage({ nonce: nonce, stack_trace: alert1.get_stack_trace(), org_msg: msg }, "*"); };\n';
//hook alert(1) (via whitelist)
s += 'alert1.hook_function(\'alert\', this, \'clsr\', this, true, [1]);\n';
s += 'alert(1);\n';

document.body.appendChild(document.createElement('script')).innerHTML=s;
