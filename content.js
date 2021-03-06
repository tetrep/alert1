// wraps what we need to preload
alert1.pre_init = function () {
  // we need to inject JS to queue alerts made before we load our settings (hooray async)
  // script_parent can be an element or an id
  this.inject_script_element = function (script, script_parent) {
    // default to trying to inject into our own div
    if (!script_parent) {
      script_parent = this.injected_div_id;
    }
    // get element by id if given id
    if (typeof script_parent === 'string') {
      script_parent = document.getElementById(script_parent);
    }
    // append to parent, if parent exists
    if (script_parent) {
      script_parent.appendChild(script);
    }
    // we don't have a parent target, inject into the first HTML element
    else {
      var temp_node = undefined;
      // find first HTML element
      // fuck nodelists...
      for (var index = 0; index < document.childNodes.length; index++) {
        if (document.childNodes[index].tagName === 'HTML') {
          temp_node = document.childNodes[index];
          break;
        }
      }
      if (temp_node) {
        // make a div to put ourselves in, if we have a name to give one
        if (this.injected_div_id) {
          var injected_div = document.createElement('div');
          injected_div.setAttribute('id', this.injected_div_id);
          injected_div.appendChild(script);
          // set script to div so we can use the same injection logic
          script = injected_div;
        }
        // if there are children, inject ourselves before them
        if (temp_node.childNodes.length != 0) {
          document.insertBefore(script, temp_node.childNodes[0]);
        }
        // no children ;)
        else {
          temp_node.appendChild(script);
        }
      }
      else {
        //console.log('error: could not find HTML tag to inject into');
        throw 'alert1: wtfbbqq';
      }
    }
  };

  // make an alert queue that we'll operate on once we load settings
  this.pre_load_settings = function () {
    this.alert_queue = [];
    this.alert_queue_wrapper = function (msg) {
      this.alert_queue.push(msg);
    }
    this.alert_bak = alert;
    alert = this.alert_queue_wrapper.bind(this);
  };

  // prep a script element that will make an alert queue so we don't miss any alerts
  // while we wait for our settings to load (hooray forced async!)
  var pre_load_js_element = document.createElement('script');
  var pre_load_js_str = 'var alert1_pre = {};\n('+this.pre_load_settings.toString()+').bind(alert1_pre)();';
  pre_load_js_element.innerHTML = pre_load_js_str;
  this.inject_script_element(pre_load_js_element);
};

alert1.post_init = function () {
  // function to process the alert queue
  this.post_load_settings = function () {
    var i = 0;
    for (i = 0; i < this.alert_queue.length; i++) {
      alert(this.alert_queue[i]);
    }
  };

  // process the alert queue
  var post_load_js_element = document.createElement('script');
  var post_load_js_str = '('+this.post_load_settings.toString()+').bind(alert1_pre)();';
  post_load_js_element.innerHTML = post_load_js_str;
  this.inject_script_element(post_load_js_element);

  // cleanup the dom by removing all the stuff we injected
  if (this.injected_div_id) {
    document.getElementById(this.injected_div_id).parentNode.removeChild(document.getElementById(this.injected_div_id));
  }
};

// =======================
// BEGIN MONOLITHIC OBJECT
// =======================
// wraps literally everthing, we don't do anything if we're not enabled
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
    if (-1 === this.whitelist.indexOf(input)) {
      //console.log('whitelist fail');
      whitelist_pass = false;
    }
  }
  //check blacklist
  if (this.blacklist) {
    if (-1 != this.blacklist.indexOf(input)) {
      //console.log('blacklist fail');
      blacklist_pass = false;
    }
  }

  //only hook if we passed whitelist and blacklist
  if (whitelist_pass && blacklist_pass) {
    //console.log('calling hook function');
    return this.hook(input);
  }
  //we don't want to hook this input if we failed white/blacklist
  else {
    //console.log('calling original function');
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

  // build the final string we will inject
  var injected_js_element_str = this.content.obj_js + nonce_js + hooked_functions_js + this.content.hook_js + this.content.hook_init_js + this.content.obj_name+'.init.bind('+this.content.obj_name+')();\n';

  // our script element
  var injected_js_element = document.createElement('script');
  injected_js_element.innerHTML = injected_js_element_str;

  // inject asap
  this.inject_script_element(injected_js_element);
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
    //console.log('valid message:');
    //console.log(event);
    event.data.location = event.source.location
    this.make_chrome_notification(event.data);
  } else {
    //console.log('invalid message:');
    //console.log(event);
  }
}).bind(this), false);

this.inject_js();
};
// =======================
// END MONOLITHIC OBJECT
// =======================

// check for whether or not our domain is in scope
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

// TODO make this supermagicdynamical along with the injected object's name
// we're very creative...
alert1.injected_div_id = "alert1_injected_div_id";

// setup to make sure we don't miss alerts while waiting for settings
alert1.pre_init();
// only do stuff if we're enabled
alert1.load_settings((function () {
  // restore alert after we hooked it to make a queue of alerts that occur before we load our settings
  var restore_alert_element = document.createElement('script');
  restore_alert_element.innerHTML = 'alert = alert1_pre.alert_bak;';
  restore_alert_element.innerHTML += '\ndocument.currentScript.parentNode.removeChild(document.currentScript);';
  this.inject_script_element(restore_alert_element);
  if (this.settings.hooking_enabled && this.check_scope_whitelist()) {
    this.init();
  }
  this.post_init();
}).bind(alert1), ['settings', 'content']);
