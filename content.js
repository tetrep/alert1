//wraps literally everthing, we don't do anything if we're not enabled
alert1.init = function () {

this.make_chrome_notification = function (data) {
  chrome.runtime.sendMessage(data, function(){});
};

this.hook_function = function (func_old_in, func_old_scope, func_new_in, func_new_scope, hook_whitelist_check_in, whitelist_in, hook_blacklist_check_in, blacklist_in) {
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

  if (hook_whitelist_check_in) {
    hooked_function.settings.hook_whitelist_check = hook_whitelist_check_in;
  }
  if (whitelist_in) {
    hooked_function.settings.whitelist = whitelist_in;
  }

  if (hook_blacklist_check_in) {
    hooked_function.settings.hook_blacklist_check = hook_blacklist_check_in;
  }
  if (blacklist_in) {
    hooked_function.settings.blacklist = blacklist_in;
  }

  //actually hook the function
  func_old_scope[func_old_in] = hooked_function.func_hook;

  return hooked_function;
};

this.default_func_hook = function (input) {
  var whitelist_pass = true;
  var blacklist_pass = true;

  //check whitelist
  if (this.settings.hook_whitelist_check) {
    if (-1 == this.settings.whitelist.indexOf(input)) {
      whitelist_pass = false;
    }
  }
  //check blacklist
  if (this.settings.hook_blacklist_check) {
    if (-1 != this.settings.blacklist.indexOf(input)) {
      blacklist_pass = false;
    }
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
};

this.get_stack_trace = function () {
  return (new Error('stack trace: '+Math.random().toString())).stack;
};

//listen for stack traces
//make a nonce that we'll use to filter postmessages
var nonce = Math.random().toString();
window.addEventListener("message", (function(event) {
  // We only accept messages from ourselves
  if (event.source != window)
    return;

  //match nonce and make sure all the data we need is available
  if (nonce == event.data.nonce && event.data.title && event.data.func && event.data.stack_trace && event.data.org_msg) {
    console.log(event.data);
    this.make_chrome_notification(event.data);
  } else {
    console.log('invalid message');
  }
}).bind(this), false);

//init string of JavaScript to inject
var s = '';

var name = 'alert1';
s += 'var '+name+' = {\n';
  //we want to inject most of ourselves 
  //skip the first 3 as they do not need to be injected
  var alert1_keys = Object.keys(this);
  var i = 0;
  for (i = 3; i < alert1_keys.length; i++)
  {
    var key = alert1_keys[i];
    var val = this[alert1_keys[i]].toString();

    s += key+': '+val+',\n';
  }

  //inject a nonce so it's harder for pages to fuck with us
  s += 'nonce: '+nonce+',\n';
  //we need to postmessage to ourselves to go from page -> content script
  s += 'clsr: function (msg) {\n';
    s += 'window.postMessage({\n';
      s+= 'nonce: this.nonce, title: document.title, func: \'alert\', stack_trace: this.get_stack_trace(), org_msg: msg\n';
    s += '}, "*");\n';
  s += '},\n';
  //hook alert(1) (via whitelist)
  s += 'init: function (hook, hook_scope) {\n';
    s += 'this.hook_function(hook, hook_scope, \'clsr\', this, true, [1]);\n';
  s += '}\n';
s += '};\n';
s += name+'.init(\'alert\', this)\n';
s += 'alert(1);\n';

document.body.appendChild(document.createElement('script')).innerHTML=s;

};

//only do stuff if we're enabled
alert1.load_settings((function () {
  if (this.settings.hooking_enabled) {
    this.init();
  }
}).bind(alert1));
