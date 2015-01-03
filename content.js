//wraps literally everthing, we don't do anything if we're not enabled
alert1.init = function () {

this.make_chrome_notification = function (data) {
  chrome.runtime.sendMessage(data, function(){});
};

this.enable_hooked_functions = function (hooked_functions) {
  hooked_functions.map(this.enable_hooked_function, this);
}

this.enable_hooked_function = function (hooked_function) {
  //set nonce
  hooked_function.nonce = this.nonce;

  //save string so we can reference target again
  hooked_function.target_str = hooked_function.target
  hooked_function.target_scope_str = hooked_function.target_scope;

  //eval to get scope
  hooked_function = this.eval_hooked_function_scope(hooked_function);


  //bind scopes of functions, functions are strings so we need to access like a map
  hooked_function.target = (hooked_function.target_scope)[hooked_function.target].bind(hooked_function.target_scope);
  hooked_function.hook = (hooked_function.hook_scope)[hooked_function.hook].bind(hooked_function);
  hooked_function.hook_wrapper = (this)[hooked_function.hook_wrapper].bind(hooked_function);
  //add stack trace function
  hooked_function.get_stack_trace = this.get_stack_trace;

  //actually hook the function
  (hooked_function.target_scope)[hooked_function.target_str] = hooked_function.hook_wrapper.bind(hooked_function);
}

this.eval_hooked_function_scope = function (hooked_function) {
  eval('hooked_function.target_scope = ' + hooked_function.target_scope);
  eval('hooked_function.hook_scope = ' + hooked_function.hook_scope);

  return hooked_function;
}

this.hook_wrapper = function (input) {
  var whitelist_pass = true;
  var blacklist_pass = true;

  //check whitelist
  if (this.whitelist) {
    if (-1 == this.whitelist.indexOf(input)) {
      console.log('whitelist fail');
      whitelist_pass = false;
    }
  }
  //check blacklist
  if (this.blacklist) {
    if (-1 != this.blacklist.indexOf(input)) {
      console.log('blacklist fail');
      blacklist_pass = false;
    }
  }

  //only hook if we passed whitelist and blacklist
  if (whitelist_pass && blacklist_pass) {
    console.log('calling hook function');
    return this.hook(input);
  }
  //we don't want to hook this input if we failed white/blacklist
  else {
    console.log('calling original function');
    return this.target(input);
  }
};

this.get_stack_trace = function () {
  return (new Error('stack trace: '+Math.random().toString())).stack;
};

this.inject_js = function () {
  var save = false;
  //build default injected object
  if (!(this.content.obj_js)) {
    save = true;
    this.content.obj_js = '';
    this.content.obj_name = 'alert1';
    this.content.obj_js += 'var '+this.content.obj_name+' = {\n';
    //the functions we want to inject
    var alert1_keys = [
      'enable_hooked_functions',
      'enable_hooked_function',
      'eval_hooked_function_scope',
      'hook_wrapper',
      'get_stack_trace'
    ];
    //var alert1_keys = Object.keys(this);
    var i = 0;
    for (i = 0; i < alert1_keys.length; i++)
    {
      var key = alert1_keys[i];
      var val = this[alert1_keys[i]].toString();

      this.content.obj_js += key+': '+val+',\n';
    }

    this.content.obj_js += '};\n';
  }

  //fresh nonce every time
  var nonce_js = this.content.obj_name+'.nonce = '+this.nonce+';\n';

  //default hooked function settings, hooks calls to alert(1)
  if (!(this.content.hooked_functions_json)) {
    save = true;
    var hooked_functions = [];
    hooked_functions.push({
      target: 'alert',
      target_scope: 'window',
      hook: 'hook',
      hook_scope: 'this',
      hook_wrapper: 'hook_wrapper',
      whitelist: [1],
    });

    this.content.hooked_functions_json = JSON.stringify(hooked_functions);
  }

  //give it to our injected structure
  var hooked_functions_js = this.content.obj_name+'.hooked_functions = '+this.content.hooked_functions_json+';\n';

  if (!(this.content.hook_js)) {
    save = true;
    //we need to postmessage ourselves to go from page -> content script
    this.content.hook_js = '';
    this.content.hook_js += this.content.obj_name+'.hook = function (msg) {\n';
      this.content.hook_js += '  window.postMessage({\n';
        this.content.hook_js += '    nonce: this.nonce, title: document.title, func: this.target_scope_str+\'.\'+this.target_str, stack_trace: this.get_stack_trace(), org_msg: msg\n';
      this.content.hook_js += '  }, "*");\n';
    this.content.hook_js += '};\n';
  }

  if (!(this.content.hook_init_js)) {
    save = true;
    //enable all our function hooks
    this.content.hook_init_js = '';
    this.content.hook_init_js += this.content.obj_name+'.init = function () {\n';
      this.content.hook_init_js += '  this.enable_hooked_functions(this.hooked_functions);\n';
    this.content.hook_init_js += '};\n';
  }

  if (save) {
    //console.log(this.content);
    this.save_settings(undefined, 'content');
  }

  document.body.appendChild(document.createElement('script')).innerHTML = this.content.obj_js + nonce_js + hooked_functions_js + this.content.hook_js + this.content.hook_init_js + this.content.obj_name+'.init.bind('+this.content.obj_name+')();\n';
};

//listen for stack traces
//make a nonce that we'll use to filter postmessages
this.nonce = Math.random().toString();
window.addEventListener("message", (function(event) {
  // We only accept messages from ourselves
  if (event.source != window)
    return;

  //match nonce and make sure all the data we need is available
  if (this.nonce == event.data.nonce && event.data.func && event.data.stack_trace) {
    console.log('valid message:');
    console.log(event);
    this.make_chrome_notification(event.data);
  } else {
    console.log('invalid message:');
    console.log(event);
  }
}).bind(this), false);

this.inject_js();
};

//check if our domain is in scope
alert1.check_scope_whitelist = function () {
  if (!this.content.scope_whitelist) {
    this.content.scope_whitelist = "[]";
  }
  re_strs = JSON.parse(this.content.scope_whitelist);
  var i = 0;
  for (i = 0; i < re_strs.length; i++) {
    regex = new RegExp(re_strs[i]);
    if (regex.exec(window.location)) {
      return true;
    }
  }

  return false;
};

//only do stuff if we're enabled
alert1.load_settings((function () {
  if (this.settings.hooking_enabled && this.check_scope_whitelist()) {
    this.init();
  }
}).bind(alert1), ['settings', 'content']);
