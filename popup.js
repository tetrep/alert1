var alert1 = {
  settings: {},
  html_settings: [];

  make_html: function () {
    this.html_settings.push(this.make_checkbox('Enable hooking:', 'hooking_enabled'));
    this.html_settings.push(this.make_checkbox('Enable sound: ', 'sound_enabled'));
  },

  make_checkbox: function (name, id) {
    var div = document.body.appendChild(document.createElement('div'));

    var checkbox_text = div.appendChild(document.createElement('p'));
    checkbox_text.innerText = name;

    var checkbox = checkbox_text.appendChild(document.createElement('input'));
    checkbox.setAttribute('id', id);
    checkbox.setAttribute('type', 'checkbox');
    if (this.settings[id]) {
      checkbox.setAttribute('checked', this.settings[id]);
    }
    checkbox.addEventListener('click', this.update_settings.bind(this), false);

    return checkbox;
  },

  update_settings: function () {
    var i = 0;
    for (i = 0; i < this.html_settings.length; i++) {
      this.settings[html_settings[i].getAttribute('id')];
    }
    this.settings.enabled = document.getElementById('settings.enabled').checked;
    chrome.storage.local.set({'settings': this.settings}, function () {});
    console.log('saved: ');
    console.log(this.settings);
  },

  load_settings: function () {
    //setup callback for after we have loaded our settings
    chrome.storage.local.get('settings',
      (function (data) {
        //handle undefined settings
        if(!(data.settings)) {
          data.settings = {};
        }
        this.settings = data.settings;
        console.log('loaded');
        console.log(data);
        console.log(this.settings);
        this.make_html();
      }).bind(this)
    );
  },

  /* looks like it's slow because it's not caching, but we might need this later if settings get big
  add_loading_div: function () {
    var loading_div_background = document.body.appendChild(document.createElement('div'));
    var loading_div_foreground = loading_div_background.appendChild(document.createElement('div'));

    //background styling
    loading_div_background.setAttribute('id', 'loading-div-background');
    loading_div_background.style.position = 'absolute';
    loading_div_background.style.top = '0';
    loading_div_background.style.left = '0';
    loading_div_background.style.width = '100%';
    loading_div_background.style.height = '100%';
    loading_div_background.style.backgroundColor = 'black';
    loading_div_background.style.background = 'rgba(0,0,0,0.8)'
    loading_div_background.style.zIndex = '1023';
    //flex
    loading_div_background.style.display = 'flex';
    loading_div_background.style.flexDirecttion = 'row';
    loading_div_background.style.flexWrap = 'nowrap';
    loading_div_background.style.justifyContent = 'center';
    loading_div_background.style.alignContent = 'center';
    loading_div_background.style.alignItems = 'center';

    //foreground styling
    loading_div_foreground.setAttribute('id', 'loading-div-foreground');
    loading_div_foreground.setAttribute('in_progress', 0);
    loading_div_foreground.style.backgroundColor = 'white';
    loading_div_foreground.style.zIndex = '1024';
  },

  remove_loading_div: function () {
    var loading_div = document.getElementById('loading-div-background');
    loading_div.parentNode.removeChild(loading_div);
  },
  //*/

  init: function () {
    this.load_settings();
  }
}

//chrome.storage.local.clear(function () {});
alert1.init();
