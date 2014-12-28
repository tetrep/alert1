var alert1 = {
  settings: {},

  make_html: function () {
    var div = document.body.appendChild(document.createElement('div'));

    var checkbox_text = div.appendChild(document.createElement('p'));
    checkbox_text.innerText = 'Enabled ';

    var checkbox = checkbox_text.appendChild(document.createElement('input'));
    checkbox.setAttribute('id', 'settings.enabled');
    checkbox.setAttribute('type', 'checkbox');
    checkbox.setAttribute('checked', this.settings.enabled);
    checkbox.addEventListener('click', this.update_settings.bind(this), false);
  },

  update_settings: function () {
    this.settings.enabled = document.getElementById('settings.enabled').checked;
    chrome.storage.local.set({'settings': this.settings}, function () {});
    console.log('saved: ');
    console.log(this.settings);
  },

  load_settings: function () {
    //setup callback for after we have loaded our settings
    chrome.storage.local.get("settings",
      (function (data) {
        //handle undefined settings
        if(!data) {
          data = {};
          data.settings = {};
        }
        this.settings = data.settings;
        console.log('loaded');
        console.log(this.settings);
        this.make_html();
      }).bind(this)
    );
  },

  init: function () {
    this.load_settings();
  }
}

chrome.storage.local.clear(function () {});
alert1.init();
