alert1 = {
  //returns given value if given 'arg' is undefined
  default_arg: function (arg, val) {
    if (typeof arg !== 'undefined') {
      return arg;
    } else {
      return val;
    }
  },

  //cb is function to call after loading settings
  //name is name of settings to load
  load_settings: function (cb, name) {
    cb = this.default_arg(cb, function () {});
    name = this.default_arg(name, ['settings']);

    //so we can always map()
    if (!(name.constructor === Array)) {
      name = [name];
    }

    actual_cb = function (data) {
      //console.log('loading:');
      //console.log(data);
      name.map(function (tmp) {
          //make empty objects for undefined keys
          if (!(this[tmp] = data[tmp])) {
            this[tmp] = {};
          }
        }, this);
      cb();
    };
    actual_cb = actual_cb.bind(this);

    chrome.storage.local.get(name, actual_cb);
  },

  save_settings: function (cb, name) {
    cb = this.default_arg(cb, function () {});
    name = this.default_arg(name, 'settings');

    data = {};
    data[name] = this[name];

    //console.log('saving:');
    //console.log(data);

    chrome.storage.local.set(data, cb);
  },

  clear_all_settings: function () {
    this.clear_settings();
  },

  clear_settings: function (cb, name) {
    console.log('clearing: ' + name);
    chrome.storage.local.remove(name, cb);
  }
};
