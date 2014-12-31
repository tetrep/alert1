//wraps literally everthing, we don't do anything if we're not enabled
alert1.init = function () {

this.make_chrome_notification = function (data) {
  chrome.runtime.sendMessage(data, function(){});
};

this.enable_hooked_functions = function (hooked_functions) {
  var i = 0;
  for (i = 0; i < hooked_functions.length; i++) {
    this.enable_hooked_function(hooked_functions[i]);
  }
}

this.enable_hooked_function = function (hooked_function) {
  //give scope to functions
  hooked_function.target = hooked_function.target.bind(hooked_function.target_scope);
  //hooked_function.hook = hooked_function.hook.bind(hooked_function.hook_scope);
  hooked_function.hook = hooked_function.hook.bind(hooked_function);
  hooked_function.hook_wrapper = hooked_function.hook_wrapper.bind(hooked_function);

  //actually hook the function
  hooked_function.target_scope[hooked_function.target] = hooked_function.hooked_wrapper;
}

this.eval_hooked_function_scopes = function (hooked_functions) {
  var i = 0;
  for (i = 0; i < hooked_functions.length; i++) {
    hooked_functions[i] = this.eval_hooked_function_scope(hooked_functions[i]);
  }

  return temp;
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
  if (this.settings.whitelist) {
    if (-1 == this.settings.whitelist.indexOf(input)) {
      whitelist_pass = false;
    }
  }
  //check blacklist
  if (this.settings.blacklist) {
    if (-1 != this.settings.blacklist.indexOf(input)) {
      blacklist_pass = false;
    }
  }

  //only hook if we passed whitelist and blacklist
  if (whitelist_pass && blacklist_pass) {
    console.log('calling new function');
    return this.func_new(input);
  }
  //we don't want to hook this input if we failed white/blacklist
  else {
    console.log('calling old function');
    return this.func_old(input);
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
      'eval_hooked_function_scopes',
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
      whitelist: ['1'],
      nonce: this.nonce
    });

    this.content.hooked_functions_json = JSON.stringify(hooked_functions);
  } else {
    //we always need a fresh nonce
    var hooked_functions = JSON.parse(this.content.hooked_functions_json);
    var i = 0;
    for (i = 0; i < hooked_functions.length; i++) {
      hooked_functions[i].nonce = this.nonce;
    }

    this.content.hooked_functions_json = JSON.stringify(hooked_functions);
  }

  if (!(this.content.hook_js)) {
    save = true;
    //we need to postmessage ourselves to go from page -> content script
    this.content.hook_js = '';
    this.content.hook_js += this.content.obj_name+'.hook = function (msg) {\n';
      this.content.hook_js += 'window.postMessage({\n';
        this.content.hook_js += 'nonce: this.nonce, title: document.title, func: this.target_scope+\'.\'+this.target, stack_trace: this.get_stack_trace(), org_msg: msg\n';
      this.content.hook_js += '}, "*");\n';
    this.content.hook_js += '};\n';
  }

  if (!(this.content.hook_init_js)) {
    save = true;
    //enable all our function hooks
    this.content.hook_init_js = '';
    this.content.hook_init_js += this.content.obj_name+'.init = function () {\n';
      //totes nasty
      this.content.hook_init_js += 'this.enable_hooked_functions(this.eval_hooked_functions('+this.content.hooked_functions_json+'));\n';
    this.content.hook_init_js += '};\n';
  }

  if (save) {
    console.log(this.content);
    //this.save_settings(undefined, 'content');
  }

  document.body.appendChild(document.createElement('script')).innerHTML = this.content.obj_js + this.content.hook_js + this.content.hook_init_js + this.content.obj_name+'.init.bind('+this.content.obj_name+');\n';
};

//listen for stack traces
//make a nonce that we'll use to filter postmessages
this.nonce = Math.random().toString();
window.addEventListener("message", (function(event) {
  // We only accept messages from ourselves
  if (event.source != window)
    return;

  //match nonce and make sure all the data we need is available
  if (this.nonce == event.data.nonce && event.data.title && event.data.func && event.data.stack_trace && event.data.org_msg) {
    console.log(event.data);
    this.make_chrome_notification(event.data);
  } else {
    console.log('invalid message');
  }
}).bind(this), false);

this.load_settings(this.inject_js.bind(this), 'content');
};
//only do stuff if we're enabled
alert1.load_settings((function () {
  if (this.settings.hooking_enabled) {
    this.init();
  }
}).bind(alert1));
