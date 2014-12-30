alert1 = {
  //cb is function to call after loading settings
  //name is name of settings to load
  load_settings: function (cb, name) {
    if (!name) {
      name = 'settings';
    }

    this[name]= {};

    actual_cb = function (data) {
      console.log('loaded: ');
      console.log(data);
      if (!(data[name])) {
        data[name] = {};
      }
      this[name] = data[name];
      cb();
    };
    actual_cb = actual_cb.bind(this);

    chrome.storage.local.get(name, actual_cb);
  }
};
