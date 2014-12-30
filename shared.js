alert1 = {
  load_settings: function (cb) {
    this.settings = {};

    if(!cb) {
      cb = this.init;
    }

    actual_cb = function (data) {
      if (!(data.settings)) {
        data.settings = {};
      }
      this.settings = data.settings;
      cb();
    };
    actual_cb = actual_cb.bind(this);

    chrome.storage.local.get('settings', actual_cb);
  }
};
